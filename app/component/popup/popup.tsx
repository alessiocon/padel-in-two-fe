import { useContext, type FC } from "react";
import { PopUpContext } from "./../../store/context";
import { createPortal } from "react-dom";


import style from "./popup.module.css";

const Backdrop: FC<{action: Function}> = ({action}) => {
    return <div className={style.backdrop} onClick={() => action()}></div>
}


const Overlay: FC<{}> = () => {
    const [popup, setPopup] = useContext(PopUpContext);



    return <div className={`${style.wrap_popup}`}>
        {popup.massage}
        <div className="text-foreground w-full">
            {popup.buttons !== undefined ? popup.buttons 
                : 
                <div className="containerBtn">
                    <button className="btn submit"
                        type="submit"
                        onClick={() => popup.action && popup.action[0]()}>{popup.action ? popup.action[1] : "Invio"}</button>
                    <button className="btn"
                        onClick={() => setPopup({massage: null})}>Chiudi</button>
                </div>
            }
        </div>
    </div>
}


const Popup: FC<{}> = () => {
    const [popup, setPopup] = useContext(PopUpContext);
    
    return <>
        {Boolean(popup.massage) && <>
            {createPortal(<Backdrop action={() => {!popup.stopPropagation && setPopup({massage: null})}} />, document.getElementById("backdrop-root")!)}
            {createPortal(<Overlay />, document.getElementById("overlay-root")!)}
        </>
        }
    </>
}

export default Popup;