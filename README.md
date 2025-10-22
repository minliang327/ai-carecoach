# 🧠 AI CareCoach — Intelligent Long-Term Care Training Assistant  
_以智能与共情，赋能每一位照护者_

---

## 🌟 Inspiration

China’s **Long-Term Care Insurance (LTCI)** system urgently needs scalable, high-quality training for community caregivers.  
Many caregivers lack access to structured, practical, and competency-based education.  
**AI CareCoach** was inspired by this gap — aiming to transform traditional training into an intelligent, interactive, and personalized learning experience.

---

## 💡 What It Does

**AI CareCoach** is an **AI-powered caregiving training assistant** designed for community caregivers under the LTCI system.  
It helps users learn and practice standardized caregiving skills through interactive modules, contextual AI guidance, and adaptive feedback.

Key features include:
- 🏥 **Five structured skill modules** (Daily Care, Basic Nursing, Symptom Management, Functional Maintenance, Psychological Care)  
- 📈 **Three-tier learning progression** — junior → intermediate → senior  
- 🧩 **Dynamic knowledge structure** with _What · Why · When · Scenario_  
- 🧠 **AI Assistant “XiaoHu”** offering contextual answers and follow-up learning suggestions  
- 🎴 **Flashcard Review mode** linking actions with reasoning for long-term retention  
- 📊 **Dashboard & Achievement System** tracking scores, study hours, and unlocked levels  
- ☁️ **AWS Lambda + S3 integration** for data retrieval and cloud storage  
- 🔒 **Offline-ready design** — can function fully in local environments for low-connectivity areas

---

## 🏗️ How We Built It

| Component | Technology Stack |
|------------|------------------|
| **Frontend UI** | HTML5, CSS3, Vanilla JS (modular) |
| **Cloud Integration** | AWS Lambda (Python 3.9) + Amazon S3 |
| **Data Storage** | JSON-based RAG dataset derived from China’s *Long-Term Care Worker Textbook (2024)* |
| **AI Assistant Logic** | In-browser text reasoning with preset scenarios and keyword matching |
| **Learning Analytics** | LocalStorage (browser) with optional DynamoDB / SageMaker extension |
| **Visualization** | Dynamic progress bars, charts, and gamified badges |
| **Speech Interaction** | Web Speech API (text-to-speech for “XiaoHu”) |

---

## 🧗 Challenges We Ran Into

- ⚙️ Configuring **AWS Lambda CORS & S3 access policies** for secure public data retrieval  
- 🌐 Balancing **local offline usability** with cloud scalability  
- 🧩 Designing bilingual UI & content that remain accessible for both Chinese and English audiences  
- 💬 Making AI explanations accurate and empathetic for real-world caregiving scenarios  
- 🎨 Optimizing the user interface for clarity, accessibility, and emotional warmth  

---

## 🏆 Accomplishments That We're Proud Of

- ✅ Built a **fully functional AI training assistant** accessible via browser and AWS cloud  
- ✅ Integrated **structured RAG-based learning materials** for LTCI caregivers  
- ✅ Implemented **gamified learning journey** with level unlocking and achievements  
- ✅ Designed **bilingual demo (EN + CN)** for global accessibility  
- ✅ Created a **sustainable training model** adaptable to future AI-driven LTC education  

---

## 📚 What We Learned

- How to design **AI-assisted pedagogy** for real-world caregivers, not just students  
- Integrating AWS tools (Lambda, S3) with **client-side intelligence** for lightweight apps  
- The power of **structured knowledge design (What–Why–When–Scenario)** to improve learning outcomes  
- Building **trustworthy human–AI interaction** with empathy and contextual precision  

---

## 🚀 What's Next for AI CareCoach

1. 🔗 Integrate **Amazon Bedrock** for personalized AI tutoring & voice-based guidance  
2. ☁️ Sync learning records to **DynamoDB + SageMaker** for competency assessment analytics  
3. 🩺 Expand dataset to include **elderly health management, chronic disease, and end-of-life care** modules  
4. 🌍 Launch **multilingual versions (EN/JP/KR)** for international caregiver certification  
5. 💬 Deploy a **mobile PWA version** for offline long-term care assistants in community settings  

---

## 🧩 Built With

- **Languages:** HTML5, CSS3, JavaScript, Python  
- **Cloud Services:** AWS Lambda, Amazon S3  
- **Tools:** Web Speech API, LocalStorage, JSON RAG datasets  
- **Design:** Responsive UI / Coursera-style dashboard  

---

## 🎥 Demo & Links

- 🔗 **Live App (Lambda Integration)**  
  https://itkmvgee3n3bvzg4upwvx5b2dm0ogcei.lambda-url.ap-northeast-1.on.aws/

- 💻 **GitHub Repository**  
  https://github.com/minliangnursing/ai-carecoach

- 🎬 **Demo Video (YouTube)**  
  [AI CareCoach - Intelligent Long-Term Care Training Assistant](https://youtube.com/shorts/CJFyshxW78c)

- 📝 **Bilingual Subtitles (.srt)**  
  [`AI_CareCoach_Demo.srt`](./AI_CareCoach_Demo.srt)

---

## 🧭 Project Structure

```plaintext
ai-carecoach/
├── index.html              # Main UI
├── app.js                  # Logic (Modules, Assistant, Flashcards)
├── /data/                  # Module content + Quizzes
│   ├── module_1.json
│   ├── quiz_module_1.json
│   └── ...
├── /lambda/                # AWS Lambda scripts
│   └── lambda_function.py
├── assets/                 # Optional (logo, watermark)
│   └── watermark.png
└── README.md               # You are here

---

## 🏗️ System Architecture Overview

```plaintext
          ┌──────────────────────────┐
          │   👩‍⚕️ User / Caregiver  │
          │  (Browser - index.html)  │
          └────────────┬─────────────┘
                       │
                       │ ① Fetch learning modules & quizzes
                       ▼
              ┌──────────────────┐
              │  AWS Lambda (Py) │
              │  lambda_function.py │
              └─────────┬────────┘
                        │
                        │ ② Get JSON files (modules, quiz)
                        ▼
             ┌────────────────────────┐
             │  Amazon S3 (ai-carecoach) │
             │  /data/module_1.json etc. │
             └─────────┬────────────────┘
                       │
                       │ ③ Return structured data (JSON)
                       ▼
          ┌──────────────────────────┐
          │ Frontend app.js          │
          │ - Render modules & flashcards │
          │ - Track progress (LocalStorage)│
          │ - AI “XiaoHu” assistant (Speech)│
          └─────────┬────────────────┘
                    │
                    │ ④ Optional Data Upload (Future)
                    ▼
       ┌──────────────────────────────┐
       │ Amazon DynamoDB / SageMaker  │
       │ - Store user progress        │
       │ - Analyze competency trends  │
       └──────────────────────────────┘
