# 🧠 AI-Powered File Organizer Agent (MCP Server)

Bu proje, **Model Context Protocol (MCP)** mimarisini kullanarak geliştirilmiş otonom bir dosya düzenleme ajanıdır. 

Geleneksel kural tabanlı (Rule-Based) sistemlerin aksine, bu ajan **LLM (Large Language Model)** destekli semantik analiz yaparak dosya içeriklerini anlar ve bağlama (context) göre organize eder.

## 🏗️ Mimari ve Teknoloji Yığını

* **Runtime:** Node.js
* **Protocol:** Model Context Protocol (MCP) over Stdio
* **Client:** Claude Desktop App
* **Libraries:** `zod` (Schema Validation), `pdf-parse` (Content Extraction)

## 🚀 Özellikler

* **Semantic Analysis:** Dosya ismine değil, içeriğine bakarak karar verir (Örn: "Turnuva" geçen bir dosyanın Fatura değil Okul Projesi olduğunu anlar).
* **Autonomous Execution:** Okuma (Göz) ve Taşıma (El) yeteneklerini otonom olarak kullanır.
* **Safety Mechanisms:** Veri kaybını önlemek için çakışma kontrolü (Collision Handling) ve hata yönetimi (Error Handling) içerir.

## 🛠️ Kurulum

1.  Repoyu klonlayın:
    ```bash
    git clone [https://github.com/KULLANICI_ADIN/ai-file-organizer.git](https://github.com/KULLANICI_ADIN/ai-file-organizer.git)
    ```
2.  Bağımlılıkları yükleyin:
    ```bash
    npm install
    ```
3.  Claude Desktop Config dosyasına ajan yolunu ekleyin.

## 📄 Lisans
MIT
