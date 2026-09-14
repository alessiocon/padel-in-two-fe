import type { Route } from "./+types/padel";
import { useLoaderData, useRevalidator } from "react-router";
import { PadelDtoId, RoundDto, type MatchDto} from "./../models/padel.dto";
import { fetchApi } from "./../services/api.service";
import React, { useContext, useState, type FC } from "react";
import {DynamicForm, DynamicInput, type formButton} from "./../component/form/form";
import { PopUpContext } from "./../store/context";
import style from "./../style/padel.module.css";
import Gironi from "./../component/gironi/gironi";
import Recovery from "./../component/recovery/recovery";

export function meta({ data }: Route.MetaArgs) {
  return [
    { title: data?.name || "Padel Event" },
    { name: "description", content: `Dettagli evento ${data?.name || "padel"}` },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const { _id } = params;

  // Fai fetch dall'API
  const response = await fetchApi<PadelDtoId>(`/padel/${_id}`);
  
  // Formatta le date sul server per evitare hydration mismatch
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Rome'
    });
  };

  return {
    ...response,
    startDateFormatted: formatDate(response.startDate),
    round: response.round.map(r => ({
      ...r,
      startFormatted: r.start ? formatDate(r.start) : null
    }))
  };
}

export default function Padel() {
  const padel = useLoaderData<typeof loader>() as PadelDtoId;
  const revalidator = useRevalidator();
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [popup, setPopup] = useContext(PopUpContext);

  function formatDate(date: Date) {
    return new Date(date).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Rome'
    });
  }
  const calcoloVincitore = (match: MatchDto[], teamA: string, teamB: string) => {
    if (!match || match.length === 0) return '-';
    
    let sq1 = 0;
    let sq2 = 0;
    match.forEach(set => { set[0] > set[1] ? sq1++ : sq2++});

    if (sq1 === sq2) return 'pareggio';
    let winner = sq1 > sq2 ? teamA : teamB;
    return winner;
  }
  
  const submitMatch = async (e: React.SubmitEvent, roundIndex: number, matchIndex?: number) => {
    e.preventDefault();
    //dati del form
    const formData = new FormData(e.target as HTMLFormElement);
    const pointSq1 = formData.get("score-sq1")?.toString();
    const pointSq2 = formData.get("score-sq2")?.toString();

    // if (matchAdd === null) return;
    const scoreA = Number(pointSq1);
    const scoreB = Number(pointSq2);

    if (isNaN(scoreA) || isNaN(scoreB) || scoreA < 0 || scoreB < 0) {
      alert("Inserisci punteggi validi");
      return;
    }

    setIsSubmitting(true);

    try {
      const matchData: MatchDto = [scoreA, scoreB];
      await fetchApi(`/padel/${padel._id}/round/${roundIndex}/match/${matchIndex ?? ""}`, {
        method: matchIndex !== undefined ? 'PATCH' : 'POST',
        body: matchData
      });


      setPopup({massage:null});

      matchIndex !== undefined ?
        padel.round[roundIndex].match[matchIndex] = matchData :   // Aggiorna lo stato locale
        padel.round[roundIndex].match.push(matchData);            // Aggiungi nuovo match allo stato locale
      
    } catch (error) {
      alert("Errore nell'aggiornamento del match");
    } finally {
      setIsSubmitting(false);
    }
  };
  const submitDeleteMatch = async (e: React.MouseEvent, roundIndex: number, matchIndex: number) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await fetchApi(`/padel/${padel._id}/round/${roundIndex}/match/${matchIndex}`, {
        method: 'DELETE',
      });

      setPopup({massage:null});

      padel.round[roundIndex].match.splice(matchIndex, 1); // Rimuovi il match dallo stato locale
    } catch (error) {
      alert("Errore nell'eliminazione del match");
    } finally {
      setIsSubmitting(false);
    }
  };
  function buildFormMatch(roundIndex: number, matchIndex?: number) : React.JSX.Element {

    let score = matchIndex !== undefined ? padel.round[roundIndex].match[matchIndex] : [0,0];
    let buttons : formButton[] = [
      {action: () => {}, label: "Invia", type: "submit", addClass: "submit"},
      {action: () => setPopup({massage:null}), label: "Annulla", type: "reset"}
    ];

    if(matchIndex !== undefined){
      buttons.splice(1,0, {action: (e) => submitDeleteMatch(e, roundIndex, matchIndex), label: "Elimina", type: "button", addClass: "cancel"});
    }

    return <>
      <h3>{matchIndex !== undefined ? "Modifica" : "Aggiungi"} Set</h3>
      <p>
        <strong>{padel.round[roundIndex].teamA}</strong> vs {" "}
        <strong>{padel.round[roundIndex].teamB}</strong>
      </p>

      <DynamicForm 
        onSubmit={(e) => submitMatch(e, roundIndex, matchIndex)}
        buttons={buttons}
      >
        <DynamicInput 
          name="score-sq1" 
          labelText={`punteggio - ${padel.round[roundIndex].teamA}`} 
          type="number" min="0" 
          required 
          addClass="" 
          value={["", () => {}]}
          defaultValue={score[0]}
          placeholder={`punteggio - ${padel.round[roundIndex].teamA}`}
        />

        <DynamicInput 
          name="score-sq2" 
          labelText={`Punteggio - ${padel.round[roundIndex].teamB}`} 
          type="number" 
          min="0" 
          required 
          addClass="" 
          value={["", () => {}]}
          defaultValue={score[1]}
          placeholder={`punteggio - ${padel.round[roundIndex].teamB}`}
        />
      </DynamicForm>
  </>
  }


  const submitRound = async (e: React.SubmitEvent, roundIndex?: number) => {
    e.preventDefault();
    //dati del form
    const formData = new FormData(e.target as HTMLFormElement);
    const sq1 = formData.get("sq1")?.toString();
    const sq2 = formData.get("sq2")?.toString();
    const campo = formData.get("campo")?.toString();
    const stato = formData.get("stato")?.toString();
    const matchFor = formData.get("matchFor")?.toString();
    const rentalSq1 = formData.get("rental-Sq1")?.toString();
    const rentalSq2 = formData.get("rental-Sq2")?.toString();

    if(sq1 === sq2){
      alert("Le squadre devono essere diverse");
      return;
    }

    let newRound: RoundDto = {
      teamA: sq1!,
      teamB: sq2!,
      campo: campo ? Number(campo) : 0,
      status: stato || "pending",
      matchFor: (matchFor as RoundDto["matchFor"]) || "safe",
      rental: [
        rentalSq1 ? Number(rentalSq1) : 0,
        rentalSq2 ? Number(rentalSq2) : 0
      ],
      match: roundIndex !== undefined ? padel.round[roundIndex].match : []
    };
    if(roundIndex !== undefined){
      newRound.start = padel.round[roundIndex]?.start ? new Date(padel.round[roundIndex].start!) :new Date();
    }

    setIsSubmitting(true);

    try {
      await fetchApi(`/padel/${padel._id}/round/${roundIndex ?? ""}`, {
        method: roundIndex === undefined ? 'POST' : 'PATCH',
        body: newRound
      });

      setPopup({massage:null});
      roundIndex !== undefined ? padel.round[roundIndex] = newRound : padel.round.push(newRound);
      
    } catch (error) {
        alert("Errore nell'aggiornamento del Round");
    } finally {
        setIsSubmitting(false);
    }
  };
  const submitDeleteRound = async (e: React.MouseEvent, roundIndex: number) => {
    e.preventDefault();
    //dati del form
    let round = padel.round[roundIndex];

    if(round.status === "end"){
      alert("Non puoi eliminare una partita conclusa");
      return;
    }
    setIsSubmitting(true);
    try {
      await fetchApi(`/padel/${padel._id}/round/${roundIndex}`, {
        method: 'DELETE',
      });

      setPopup({massage:null});
      padel.round.splice(roundIndex, 1); // Rimuove il round dallo stato locale
    } catch (error) {
        alert("Errore nell'aggiornamento del Round");
    } finally {
        setIsSubmitting(false);
    }
  };
  function buildFormRound(roundIndex?: number) : React.JSX.Element {

    let list = <>{padel.teams.map((team) => <option key={team} value={team}>{team}</option>)}</>;
    let round : RoundDto  = {
      teamA: "",
      teamB: "",
      campo: 0,
      status: "pending",
      matchFor: "safe",
      rental: [0,0],
      match: []
    }

    let buttons : formButton[] = [
      {action: () => {}, label: "Invia", type: "submit", addClass: "submit"},
      {action: () => setPopup({massage:null}), label: "Annulla", type: "reset"}
    ];

    if(roundIndex !== undefined){
      round = padel.round[roundIndex];
      buttons.splice(1,0, {action: (e) => submitDeleteRound(e, roundIndex), label: "Elimina", type: "button", addClass: "cancel"});
    }


    return<>
      <h3>{roundIndex !== undefined ? "Modifica Partita" : "Aggiungi una nuova partita"}</h3>
      
      <DynamicForm 
        onSubmit={(e) => submitRound(e, roundIndex)}
        buttons={buttons}
      >

        <div>
          <label htmlFor="sq1">Squadra 1</label>
          <select id="sq1" name="sq1" defaultValue={round.teamA}>
            {list}
          </select>
        </div>
        
        <div>
          <label htmlFor="sq2">Squadra 2</label>
          <select id="sq2" name="sq2" defaultValue={round.teamB}>
            {list}
          </select>
        </div>
        

        <DynamicInput 
          name="campo" 
          labelText={`campo`} 
          type="number" min="0" max="10"
          defaultValue={round.campo}
          required 
          addClass=""
          value={["", () => {}]} 
          placeholder={`inserisci il numero del campo`}
        />
        <div>
          <label htmlFor="stato">Scegli lo stato</label>
          <select id="stato" name="stato" defaultValue={round.status}>
            <option value="pending">DA FARE</option>
            <option value="inprogress">IN CORSO</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="matchFor">Fase</label>
          <select id="matchFor" name="matchFor" defaultValue={round.matchFor}>
            <option value="girone">Girone</option>
            <option value="safe">Ripescaggio</option>
          </select>
        </div>
        

        <DynamicInput 
          name="rental-Sq1" 
          labelText={`pale prestate alla squadra 1`} 
          type="number" min="0" max="2"
          addClass=""
          defaultValue={round.rental[0]}
          value={["", () => {}]} 
          placeholder={`inserisci il numero di pale prestate alla squadra 1`}
        />

        <DynamicInput 
          name="rental-Sq2" 
          labelText={`pale prestate alla squadra 2`} 
          type="number" min="0" max="2"
          addClass=""
          defaultValue={round.rental[1]}
          value={["", () => {}]} 
          placeholder={`inserisci il numero di pale prestate alla squadra 2`}
        />
      </DynamicForm>
    </>
  }


  const submitEndMatch = async (roundIndex: number) => {
    setIsSubmitting(true);

    try {
      let response = await fetchApi(`/padel/${padel._id}/round/${roundIndex}/winner`, {
        method: 'POST',
      });

      setPopup({massage:null});
      revalidator.revalidate(); // Ricarica i dati
    } catch (error) {
        alert("Errore nella terminazione della partita");
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <div className="padel-detail">
      <h1>{padel.name}</h1>
      <div className="padel-info">
        <p><strong>Location:</strong> {padel.location}</p>
        <p><strong>Data Inizio:</strong> {formatDate(padel.startDate)}</p>
        <p><strong>Numero Gironi:</strong> {padel.gironiCount}</p>
      </div>

      <div className={style.teamsContainer}>
        <div className={style.titleContainer}>
          <h2 className={style.title}>SQUADRE - {padel.teams.length}</h2>
        </div>
        
        <ul>
          {padel.teams.map((team, index) => (
            <li key={index}>
              <button
                className={`btn`}
                disabled={true}
              >
                {team}
              </button>
            </li>
          ))}
        </ul>
      </div>

      
      <div className={style.titleContainer}>
        <h2 className={style.title}>Partite</h2>
        <button onClick={e => {e.preventDefault(); 
            setPopup({massage: buildFormRound(), buttons: null});}}
            className={`btn`}
          >
            + Partita
          </button>
      </div>

      <div className={style.roundContainer}>
        
        {padel.round.map((round, roundIndex) => (

          <div 
            key={`${round.teamA}-${round.teamB}-${round.matchFor.toLowerCase()}`} 
            className={`${style.roundItem} ${round.matchFor}`}
          >

          <p className={style.roundStart}>{round.start ? formatDate(round.start) : "00/00/00, 00:00"}</p>
          <p className={style.roundTitle}>{round.teamA} <span>vs</span> {round.teamB}</p>
          
          <div className={`${style.roundDetails} status-${round.status.toLowerCase()}`}>
              <p>{round.matchFor.toUpperCase()}</p>
              <p>Campo: {round.campo}</p>
              <p>{round.status.toUpperCase()}</p>
            </div>

          <div className={style.roundInfo}>
            <div className={style.matchContainer}>
              <h4>RISULTATI SET</h4>
              <div>
                  <ul className={style.listMatch}>
                  {round.match.map((match, matchIndex) => (
                    <li key={matchIndex} 
                      className={`${style.match} ${round.status.toLowerCase()}`}>
                      <button
                        onClick={e => {e.preventDefault();
                          if (round.status.toLocaleLowerCase() === "end") return;
                          setPopup({massage: buildFormMatch(roundIndex, matchIndex), buttons: null});
                      }}>
                        <p>{`Set ${matchIndex + 1}`}</p>
                        <p>{`${match[0]} - ${match[1]}`}</p>
                      </button>
                    </li>
                  ))}
                  </ul>
                  
                  <div className={style.matchActions}>
                    <button onClick={e => {e.preventDefault(); 
                      setPopup({massage: buildFormMatch(roundIndex), buttons: null});}}
                      className={`btn`}
                      disabled={round.status.toLocaleLowerCase() !== "inprogress"}
                    >
                      {round.status.toLocaleLowerCase() === "inprogress" && "+ Set"}
                      {round.status.toLocaleLowerCase() === "end" && calcoloVincitore(round.match, round.teamA, round.teamB).toUpperCase() }
                      {round.status.toLocaleLowerCase() === "pending" && "ferma"}
                    </button>
                    <button onClick={e => {e.preventDefault(); 
                      setPopup({massage: buildFormRound(roundIndex),buttons: null});}}
                      className={`btn`}
                      disabled={round.status.toLocaleLowerCase() === "end"}
                    >
                      modifica partita
                    </button>

                    <button onClick={e => {e.preventDefault(); 
                      setPopup({massage: <p>Vuoi concludere la partita?</p>, action: [() => submitEndMatch(roundIndex), "Si"]});}}
                      className={`btn cancel`}
                      disabled={round.status.toLocaleLowerCase() === "end" || round.match.length === 0}
                    >
                      termina partita
                    </button>
                  </div>
              </div>
            </div>
          </div>
        </div>))}

      </div>
      
      <div>
        <p>Ripescaggio</p>
        {//tabella di ripescaggio dove è visibile il nome della squadra "team", il numero di partite fatte "round", i punti fatti "points" e i punti subiti "hit", e la differenza dei punti fatti e sumbiti points - hit 
        //tutto questo in una tabella con una riga per ogni squadra presente nel campo recovery di padel filtrato per numero di partite fatte in ordine discendente e con evidenziata la squadra con più punti positivi (points - hit)

        }

        <Recovery recovery={padel.recovery}/>

        {/* <ul>
          {padel.recovery.map((rec, index) => (
            <li key={index}>
              <button
                className={`btn`}
                disabled={true}
              >
                {rec.team} - {rec.round} - {rec.points.reduce((acc, curr) => acc + curr, 0) - rec.hit.reduce((acc, curr) => acc + curr, 0)} punti
              </button>
            </li>
          ))}
        </ul> */}
      </div>

      <div>
        <p>torneo</p>
        <Gironi padel={padel}/>
      </div>


    </div>
  );
}
