import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { createRequire } from "module";

// --- YAMA: PDF Kütüphanesi Hatası İçin ---
if (!global.DOMMatrix) {
    global.DOMMatrix = class DOMMatrix {
        constructor() { this.m = [1, 0, 0, 1, 0, 0]; }
        toString() { return "matrix(1, 0, 0, 1, 0, 0)"; }
        translate() { return this; }
        scale() { return this; }
    };
}
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

const server = new McpServer({
  name: "Gercek-AI-Ajan",
  version: "1.0.0",
});

// --- TOOL 1: GÖZ (Klasörü Tara ve İçerikleri Oku) ---
server.tool(
  "klasoru_analiz_et",
  "Verilen klasördeki dosyaların listesini ve içeriklerinin özetini (ilk 2000 karakter) getirir. Bu veriyi kullanarak dosyanın ne olduğuna SEN karar vereceksin.",
  {
    klasor_yolu: z.string().describe("Taranacak klasörün tam yolu")
  },
  async ({ klasor_yolu }) => {
    try {
      const dosyalar = await fs.readdir(klasor_yolu);
      const analizSonuclari = [];

      for (const dosya of dosyalar) {
        const tamYol = path.join(klasor_yolu, dosya);
        
        // Klasörse atla
        try {
            const stats = await fs.stat(tamYol);
            if (stats.isDirectory()) continue;
        } catch { continue; }

        const uzanti = path.extname(dosya).toLowerCase();
        let icerikOzeti = "Okunamayan dosya formatı";

        // PDF OKUMA
        if (uzanti === ".pdf") {
            try {
                const dataBuffer = await fs.readFile(tamYol);
                const data = await pdf(dataBuffer);
                // Sadece ilk 2000 karakteri al (Hepsini alırsak Claude'un hafızası dolabilir)
                icerikOzeti = data.text.substring(0, 2000).replace(/\s+/g, ' ').trim();
            } catch (err) {
                icerikOzeti = "PDF okunamadı (Şifreli veya bozuk)";
            }
        } 
        // METİN/KOD OKUMA
        else if ([".txt", ".md", ".json", ".js", ".html", ".css", ".py", ".sql"].includes(uzanti)) {
            try {
                const metin = await fs.readFile(tamYol, "utf-8");
                icerikOzeti = metin.substring(0, 2000).replace(/\s+/g, ' ').trim();
            } catch { icerikOzeti = "Metin okunamadı"; }
        }
        else {
            icerikOzeti = "Binary/Medya dosyası (İçerik okunamadı, isme göre analiz et)";
        }

        analizSonuclari.push({
            dosya_adi: dosya,
            uzanti: uzanti,
            icerik_baslangici: icerikOzeti
        });
      }

      // Claude'a JSON formatında rapor dönüyoruz
      return { 
        content: [{ 
            type: "text", 
            text: JSON.stringify(analizSonuclari, null, 2) 
        }] 
      };

    } catch (error) {
      return { content: [{ type: "text", text: `Hata oluştu: ${error.message}` }] };
    }
  }
);

// --- TOOL 2: EL (Dosyayı Taşı) ---
server.tool(
  "dosyayi_tasi",
  "Karar verdiğin dosyayı, belirlediğin hedef klasöre taşır.",
  {
    dosya_adi: z.string().describe("Taşınacak dosyanın sadece adı (Örn: espor.pdf)"),
    kaynak_klasor: z.string().describe("Dosyanın şu an bulunduğu klasör"),
    hedef_klasor: z.string().describe("Dosyanın gideceği YENİ klasör yolu (Örn: .../Okul/Projeler)")
  },
  async ({ dosya_adi, kaynak_klasor, hedef_klasor }) => {
    try {
        const eskiYol = path.join(kaynak_klasor, dosya_adi);
        
        // Hedef klasör yoksa oluştur
        await fs.mkdir(hedef_klasor, { recursive: true });
        
        const hedefYol = path.join(hedef_klasor, dosya_adi);

        // Çakışma kontrolü
        try {
            await fs.access(hedefYol);
            const parcalar = path.parse(dosya_adi);
            const yeniAd = `${parcalar.name}_${Date.now()}${parcalar.ext}`;
            await fs.rename(eskiYol, path.join(hedef_klasor, yeniAd));
            return { content: [{ type: "text", text: `✅ ${dosya_adi} -> ${hedef_klasor} (İsim değiştirildi: ${yeniAd})` }] };
        } catch {
            await fs.rename(eskiYol, hedefYol);
            return { content: [{ type: "text", text: `✅ ${dosya_adi} -> ${hedef_klasor}` }] };
        }
    } catch (error) {
        return { content: [{ type: "text", text: `❌ Hata: ${error.message}` }] };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("AI Ajan Modu Aktif 🧠");
}

main().catch((error) => { console.error(error); process.exit(1); });