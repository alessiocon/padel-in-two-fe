import React, {type FC, useContext} from 'react';
import { useRevalidator } from 'react-router';
import { PadelDto, PadelDtoId, RoundDto } from './../../models/padel.dto';
import style from './gironi.module.css';
import { DynamicForm } from './../form/form';
import { PopUpContext } from './../../store/context';
import { fetchApi } from './../../services/api.service';


const Gironi: FC<{padel: PadelDtoId}> = ({ padel }) => {

    const [popup, setPopup] = useContext(PopUpContext);
    const revalidator = useRevalidator();

    if (!padel.gironi || padel.gironi.length === 0) {
        return <div className={style.empty}>Nessun girone disponibile</div>;
    }


    let a = [];
    let gironiSplit = [...padel.gironi];
    let count = 0;


    async function handleSubmitModGirone(e: React.SubmitEvent, indexGirone: number ) {
        e.preventDefault();
            //dati del form
        const formData = new FormData(e.currentTarget as HTMLFormElement);
        const sq1 = formData.get("sq1") as string;
        const sq2 = formData.get("sq2") as string;

        if(sq1 === sq2){
            alert("Le squadre devono essere diverse");
            return;
        }

        padel.gironi[indexGirone][0] = sq1;
        padel.gironi[indexGirone][1] = sq2;
 
        try {
            await fetchApi(`/padel/${padel._id}`, {
            method: 'PATCH',
            body: {gironi: padel.gironi}
            });
    
            setPopup({massage:null});
            // revalidator.revalidate(); // Ricarica i dati
        } catch (error) {
            if (error instanceof Error) {
                alert(`${error.message}`);
            }
        }
    }

    function updatePosition(index:number, teamA:string, teamB:string) {
  
        let list = <>{padel.teams.map((team) => <option key={team} value={team}>{team}</option>)}</>;
        
        return <DynamicForm 
            onSubmit={(e) => {handleSubmitModGirone(e, index)}}
            buttons={[
                {action: () => {}, label: "Invia", type: "submit", addClass: "submit"},
                {action: () => setPopup({massage:null}), label: "Annulla", type: "reset"}]}
        >
            <div>
                <label htmlFor="sq1">Squadra 1</label>
                <select id="sq1" name="sq1" defaultValue={teamA}>
                    {list}
                </select>
            </div>
        
            <div>
            <label htmlFor="sq2">Squadra 2</label>
            <select id="sq2" name="sq2" defaultValue={teamB}>
                {list}
            </select>
            </div>

        </DynamicForm>
    }

    async function createRoundGirone(effectiveIndex: number) {

        let [sq1, sq2] = padel.gironi[effectiveIndex];

        if(!sq1 || !sq2){
            alert("Mancano le squadre per avviare la partita, controlla lo stato delle partite precedenti per i gironi");
            return;
        }
        if(sq1 === sq2){
            alert("Le squadre devono essere diverse");
            return;
        }

        try {
            await fetchApi(`/padel/${padel._id}/round/gironenext/${effectiveIndex}`, {
            method: 'POST',
            });
    
            setPopup({massage:null});
            revalidator.revalidate(); // Ricarica i dati

        } catch (error) {
            if (error instanceof Error) {
                alert(`${error.message}`);
            }
        }
        
    }

    let position = 0;
    for (let i= 0; i < Math.sqrt(padel.gironi.length + 1) ; i++) {
        let gironiForThisRound = gironiSplit.splice(0, (gironiSplit.length +1 )/2);
        position += gironiForThisRound.length;

        a.push(<div key={i} className={style.gironiContainer}>
            {gironiForThisRound.map((round, roundIndex) => {
                let effectiveIndex = count++;
                let winner = "";

                let roundEnd = padel.round.find(r => r.teamA === round[0] && r.teamB === round[1] && r.matchFor === "girone" && r.status === "end");
                if (roundEnd){
                    let sq1 = 0;
                    let sq2 = 0;
                    roundEnd.match.forEach(set => { set[0] > set[1] ? sq1++ : sq2++});
                    sq1 > sq2 ? winner = round[0] ?? "" : winner = round[1] ?? "";
                }
                
                return <div key={roundIndex} className={style.roundCard}>
                    <button onClick={(e) => {
                        e.preventDefault();
                        if(i === 0){ setPopup({massage: updatePosition(roundIndex, round[0] ?? "", round[1] ?? ""), buttons:[]})}
                    }}
                    >
                        <span className={`${style.team} ${winner === round[0] ? style.teamWinner : ""}`}>
                            {round[0] ?? "nessuno" }
                        </span>
                        <span className={`${style.team} ${winner === round[1] ? style.teamWinner : ""}`}>
                            {round[1] ?? "nessuno" }
                        </span>
                    </button>
                    {((round[0] && round[1]) || 1===1) && 
                        <button onClick={(e) => {
                        e.preventDefault();
                        setPopup({massage: <p>Sei sicuro di voler creare la partita?</p>, 
                            action: [() => createRoundGirone(effectiveIndex), "Si"]});
                        }}>
                        Crea partita
                    </button>}
                </div>
                
            })}
        </div>
        )
    };

    return <div className={style.container}>
        {a}
    </div>
};

export default Gironi;
