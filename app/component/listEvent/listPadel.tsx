import { PadelDto, PadelDtoId } from '~/models/padel.dto';
import { Link } from 'react-router';
import style from './listPadel.module.css';


export default function ListPadel({ padels }: { padels: PadelDtoId[] }) {

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('it-IT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
  };

  return (
      <>
          <h2 className={`${style.title}`}>Lista Eventi Padel</h2>
          {padels.length === 0 ? (
            <ul className={style.padelList}>
                <li className={style.padelItem}>
                    nessun evento disponibile
                </li>
            </ul>
          ) : (
              <ul className={style.padelList}>
                  {padels.map((padel) => (
                      <li key={padel.name} className={style.padelItem}>
                          <Link to={`/padel/${padel._id}`} state={{ padel }}>
                            <h3 className={`${style.title}`}>{padel.name}</h3>
                            <div className={style.padelDetails}>
                                <p>{formatDate(padel.startDate)}</p>
                                <p>{padel.location}</p>
                                <p><strong>N. Squadre:</strong> {padel.teams.length}</p>
                                <p><strong>Girone</strong> {padel.gironiCount}</p>
                            </div>
                          </Link>
                      </li>
                  ))}
              </ul>
          )}
      </>
    );
}
