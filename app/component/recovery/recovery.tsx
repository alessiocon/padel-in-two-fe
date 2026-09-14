import React, {type FC, useContext} from 'react';
import { useRevalidator } from 'react-router';
import { PadelDto, PadelDtoId, RecoveryDto, RoundDto } from './../../models/padel.dto';
import style from './recovery.module.css';
import { DynamicForm } from './../form/form';
import { PopUpContext } from './../../store/context';
import { fetchApi } from './../../services/api.service';


const Recovery: FC<{recovery: RecoveryDto[]}> = ({ recovery }) => {

    const [popup, setPopup] = useContext(PopUpContext);
    const revalidator = useRevalidator();

    

    return <table className={style.table}>
        <thead>
            <tr>
                <th>Squadra</th>
                <th>Round</th>
                <th>Punti</th>
            </tr>
        </thead>
        <tbody>
            {recovery.map((rec, index) => {
                if(rec.loses){ return null }; // Salta le squadre che hanno perso
                const points = rec.points.reduce((acc, curr) => acc + curr, 0);
                const hit = rec.hit.reduce((acc, curr) => acc + curr, 0);
                const difference = points - hit;
                
                return (
                    <tr key={index}>
                        <td>{rec.team}</td>
                        <td>{rec.round}</td>
                        <td>{difference}</td>
                    </tr>
                );
            })}
        </tbody>
    </table>
};

export default Recovery;
