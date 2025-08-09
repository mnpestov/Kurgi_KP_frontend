// Обрезаем секунды: "HH:MM:SS" -> "HH:MM"
export const trimTime = (t) => (t && typeof t === 'string' && t.length >= 5) ? t.slice(0, 5) : t;

export const normalizeTimes = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  return {
    ...obj,
    startTimeStartEvent: trimTime(obj.startTimeStartEvent),
    endTimeStartEvent:   trimTime(obj.endTimeStartEvent),
    startTimeEndEvent:   trimTime(obj.startTimeEndEvent),
    endTimeEndEvent:     trimTime(obj.endTimeEndEvent),
  };
};

// Нормализовать структуру ответа КП (форму + списки)
export const normalizeKpResponse = (data) => {
  if (!data) return data;
  const out = { ...data };

  if (out.formData) out.formData = normalizeTimes(out.formData);
  if (Array.isArray(out.listsKp)) {
    out.listsKp = out.listsKp.map(normalizeTimes);
  }
  return out;
};
