export class RecordHelper {
  /**
   * Converte un array di elementi in un Record indicizzato da una chiave specifica.
   * 
   * @param items Array di elementi da convertire
   * @param keySelector Funzione per estrarre la chiave da ogni elemento, oppure il nome della proprietà stringa
   */
  public static fromArray<T, K extends string | number | symbol>(
    items: T[],
    keySelector: (item: T) => K
  ): Record<K, T> {
    return items.reduce((acc, item) => {
      const key = keySelector(item);
      if (key !== undefined && key !== null) {
        acc[key] = item;
      }
      return acc;
    }, {} as Record<K, T>);
  }

  /**
   * Converte un array di oggetti indicizzandoli direttamente tramite il nome di una proprietà chiave (es. "id").
   */
  public static fromArrayByProperty<T, K extends keyof T>(
    items: T[],
    propertyName: K
  ): Record<string, T> {
    return items.reduce((acc, item) => {
      const keyValue = item[propertyName];
      if (keyValue !== undefined && keyValue !== null) {
        acc[String(keyValue)] = item;
      }
      return acc;
    }, {} as Record<string, T>);
  }
}