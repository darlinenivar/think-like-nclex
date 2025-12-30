export type QType = "mcq" | "sata";

export type Question = {
  id: string;
  system:
    | "Cardio"
    | "Respiratory"
    | "Neuro"
    | "Renal"
    | "Endocrine"
    | "OB/Peds"
    | "Safety";
  qtype: QType;
  prompt_es: string;
  prompt_en: string;
  options: {
    id: string;
    text_es: string;
    text_en: string;
  }[];
  correct: string[];
  rationale_es: string;
  rationale_en: string;
};

export const QUESTION_BANK: Question[] = [
  {
    id: "resp-001",
    system: "Respiratory",
    qtype: "mcq",
    prompt_es:
      "Paciente con EPOC: ¿cuál hallazgo indica que el intercambio gaseoso está empeorando?",
    prompt_en:
      "Client with COPD: which finding indicates worsening gas exchange?",
    options: [
      {
        id: "a",
        text_es: "SatO2 91% en reposo",
        text_en: "SpO2 91% at rest",
      },
      {
        id: "b",
        text_es: "Somnolencia y confusión nueva",
        text_en: "New drowsiness and confusion",
      },
      {
        id: "c",
        text_es: "Tos productiva crónica",
        text_en: "Chronic productive cough",
      },
      {
        id: "d",
        text_es: "Uso de labios fruncidos",
        text_en: "Pursed-lip breathing",
      },
    ],
    correct: ["b"],
    rationale_es:
      "Los cambios neurológicos como somnolencia o confusión indican retención de CO₂ o hipoxemia, señales de empeoramiento del intercambio gaseoso.",
    rationale_en:
      "Neurologic changes such as drowsiness or confusion suggest CO₂ retention or worsening hypoxemia.",
  },
  {
    id: "card-001",
    system: "Cardio",
    qtype: "sata",
    prompt_es:
      "Dolor torácico sospechoso de infarto agudo de miocardio: ¿qué acciones son prioritarias? (Seleccione todas las que apliquen)",
    prompt_en:
      "Suspected acute myocardial infarction: which actions are priorities? (Select all that apply)",
    options: [
      {
        id: "a",
        text_es: "Obtener ECG de 12 derivaciones",
        text_en: "Obtain a 12-lead ECG",
      },
      {
        id: "b",
        text_es: "Administrar oxígeno si hay hipoxemia",
        text_en: "Administer oxygen if hypoxemic",
      },
      {
        id: "c",
        text_es: "Administrar aspirina si no hay contraindicación",
        text_en: "Give aspirin if no contraindication",
      },
      {
        id: "d",
        text_es: "Indicar caminata para reducir ansiedad",
        text_en: "Encourage ambulation to reduce anxiety",
      },
      {
        id: "e",
        text_es: "Establecer acceso IV y medir troponinas",
        text_en: "Establish IV access and draw troponins",
      },
    ],
    correct: ["a", "b", "c", "e"],
    rationale_es:
      "Las prioridades incluyen ECG inmediato, oxígeno si está indicado, aspirina, acceso IV y biomarcadores. La caminata no es segura.",
    rationale_en:
      "Priorities include immediate ECG, oxygen if indicated, aspirin, IV access, and cardiac biomarkers. Ambulation is unsafe.",
  },
  {
    id: "neuro-001",
    system: "Neuro",
    qtype: "mcq",
    prompt_es:
      "Paciente con ACV isquémico agudo: ¿cuál intervención es prioritaria?",
    prompt_en:
      "Client with acute ischemic stroke: which intervention is the priority?",
    options: [
      {
        id: "a",
        text_es: "Administrar aspirina inmediatamente",
        text_en: "Administer aspirin immediately",
      },
      {
        id: "b",
        text_es: "Evaluar elegibilidad para trombólisis",
        text_en: "Assess eligibility for thrombolysis",
      },
      {
        id: "c",
        text_es: "Iniciar rehabilitación temprana",
        text_en: "Start early rehabilitation",
      },
      {
        id: "d",
        text_es: "Administrar sedantes",
        text_en: "Administer sedatives",
      },
    ],
    correct: ["b"],
    rationale_es:
      "En un ACV isquémico agudo, la prioridad es determinar rápidamente si el paciente es candidato a trombólisis.",
    rationale_en:
      "In acute ischemic stroke, the priority is rapid assessment for thrombolytic therapy eligibility.",
  },
];
