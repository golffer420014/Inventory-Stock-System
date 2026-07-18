/** pg driver คืนค่า timestamptz เป็น Date object จริง แม้ type ฝั่ง TS จะประกาศเป็น string ก็ตาม แปลงเป็น ISO string ให้ชัดเจนอีกที */
export const toIsoString = (value: string | Date): string => new Date(value).toISOString()
