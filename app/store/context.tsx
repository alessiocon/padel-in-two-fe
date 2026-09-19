import { createContext, type JSX } from "react";

export interface I_PopupContext {
    massage: JSX.Element | null;
    buttons?: JSX.Element[] | null;
    wrapperClass?: string;
    stopPropagation?: boolean;
    action?: [() => void, string];
}

export interface I_AuthContext {
    id: string;
    auth: boolean;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
}

type I_PopupContextUseState = [I_PopupContext, React.Dispatch<React.SetStateAction<I_PopupContext>>];
type I_AuthContextUseState = [I_AuthContext, React.Dispatch<React.SetStateAction<I_AuthContext>>];



export let PopUpContext = createContext<I_PopupContextUseState>(null as unknown as I_PopupContextUseState);
export let AuthContext = createContext<I_AuthContextUseState>(null as unknown as I_AuthContextUseState);