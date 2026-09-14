export interface FetchOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    body?: any;
    headers?: Record<string, string>;
}

/**
 * Ottiene l'URL base dell'API in base all'ambiente
 */
function getApiBaseUrl(): string {
    // Nel browser, usa la variabile d'ambiente Vite
    if (typeof window !== 'undefined') {
        return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3111/api';
    }
    // Nel server, usa la variabile d'ambiente o default backend
    return (process.env.API_BASE_URL || 'http://backend:3111') ;
}

/**
 * Funzione centralizzata per gestire tutte le chiamate API
 * @param url - URL dell'endpoint
 * @param options - Opzioni della richiesta (method, body, headers)
 * @returns Promise con i dati tipizzati
 */
export async function fetchApi<T>(url: string, options?: FetchOptions): Promise<T> {
    const { method = 'GET', body, headers = {} } = options || {};

    const config: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
            
        },
        credentials: "include",
        
    };

    if (body && method !== 'GET') {
        config.body = JSON.stringify(body);
    }

    try {
        const apiBaseUrl = getApiBaseUrl();
        const fullUrl = apiBaseUrl + url;
        let res = await fetch(fullUrl, config);
        let data = await res.json();

        // if(res.status === 401){
        //     const refreshRes= await  fetch(apiBaseUrl + "/auth/refresh", {...config, body:null, method:"POST"});
            
        //     if (refreshRes.ok) {
        //         // Refresh riuscito → ritentiamo la chiamata originale
        //         res = await fetch(fullUrl, config);
        //         data = await res.json();
        //     }
        // }

        if (!res.ok) {
            let serverMessage = '';
            serverMessage = data.message ?? "" 
            
            throw new Error(`${serverMessage || res.statusText}`);
        }
        
        return data as T;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`${error.message}`);
        }
        throw new Error('Errore sconosciuto nella richiesta API');
    }
}

/**
 * Funzione GET semplificata
 */
export async function get<T>(url: string): Promise<T> {
    return fetchApi<T>(url, { method: 'GET' });
}

/**
 * Funzione POST semplificata
 */
export async function post<T>(url: string, body: any): Promise<T> {
    return fetchApi<T>(url, { method: 'POST', body });
}

/**
 * Funzione PUT semplificata
 */
export async function put<T>(url: string, body: any): Promise<T> {
    return fetchApi<T>(url, { method: 'PUT', body });
}

/**
 * Funzione DELETE semplificata
 */
export async function del<T>(url: string): Promise<T> {
    return fetchApi<T>(url, { method: 'DELETE' });
}
