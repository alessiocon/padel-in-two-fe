import type { Route } from "./+types/adminTournamentManagement";
import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLoaderData } from 'react-router';
import {
  ShieldAlert,
  AlertCircle,
  CheckCircle,
  Users,
  ArrowLeft,
} from 'lucide-react';
import { Badge } from '~/components/ui/badge';
import { TournamentResDto } from "../client/model/response/tournament.res.dto";
import { MatchStatus } from "../client/model/common/Enum/matchStatus.dto";
import { MatchFormat } from "../client/model/common/Enum/match.format.dto";
import { apiClient } from "./../client/apiClient";
import type { TournamentMatchResDto } from "../client/model/response/tournament.match.res.dto";
import TournamentBracket from "../components/tournament/bracket/tournament.bracket";
import { RecordHelper } from "../helper/recordConverter";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Admin gestione evento" },
    { name: "description", content: "gestione evento by admin" },
  ];
}

// export const mockTournamentDetail: TournamentResDto = {
//     id: "256dfa1a-e7b3-4cd8-8927-859c5c0e7080",
//     title: "PadelFlash",
//     description: "Evento in un unica serata per principianti avanzati e intermedi base, 1set , 6 game, 5-5 tiebrack, 40-40 punto de oro ",
//     position: "Via atellana 65, Arzano",
//     municipality: "Arzano",
//     province: "Napoli",
//     award: "100€",
//     startsAt: new Date("2026-10-02T19:00:00.000Z"),
//     endsAt: new Date("2026-10-02T22:00:00.000Z"),
//     timezone: "Europe/Rome",
//     maxTeams: 8,
//     isClosed: true,
//     isVisible: true,
//     teams: [
//     {
//       id: "39d60df0-978c-4ee4-bd41-c2633304ceef",
//       tournamentId: "39d60df0-978c-4ee4-bd41-c2633304ceef",
//       player1Id: "1119cb04-5449-4d15-a7dc-c1c17ac3ef2d",
//       player2Id: "b38c3080-75f8-430c-a407-c8b94995c852",
//       player2FName: null,
//       player2LName: null,
//       player2Phone: null,
//       teamName: "FC game",
//       player1: {
//         firstName: "Carmine",
//         lastName: "Fusco ",
//         phone: "33856661359",
//         username: "ca78"
//       },
//       player2: {
//         firstName: "Cristian",
//         lastName: "Fusco",
//         phone: "3509478023",
//         username: "cristian22"
//       }
//     },
//     {
//       id: "69808c4c-7fa6-4b25-b603-ef84205b5b77",
//       tournamentId: "69808c4c-7fa6-4b25-b603-ef84205b5b77",
//       player1Id: "0a59b19a-e98c-4edb-a2a8-e1ae6159d3ec",
//       player2Id: "27e2521b-5e03-4aa7-a322-e6bba6636df0",
//       player2FName: null,
//       player2LName: null,
//       player2Phone: null,
//       teamName: "Los peores",
//       player1: {
//         firstName: "Pasquale",
//         lastName: "Di Febbraro",
//         phone: "3665907568",
//         username: "Pakymanuel"
//       },
//       player2: {
//         firstName: "Andrea",
//         lastName: "Dioneo",
//         phone: "3387027877",
//         username: "DIONEO "
//       }
//     },
//     {
//       id: "83d21411-c1d3-4cc2-9d04-08635dea930a",
//       tournamentId: "83d21411-c1d3-4cc2-9d04-08635dea930a",
//       player1Id: "c89d72ec-fbad-421d-a7bb-6dd8c9a9c001",
//       player2Id: "f3181ed7-b31b-4d31-899e-a8b5ee0ab9e7",
//       player2FName: null,
//       player2LName: null,
//       player2Phone: null,
//       teamName: "Mi-Teo",
//       player1: {
//         firstName: "Michele",
//         lastName: "Porrino",
//         phone: "3914617426",
//         username: "Michele31"
//       },
//       player2: {
//         firstName: "Teodoro",
//         lastName: "Buonanno",
//         phone: "3751123603",
//         username: "Teodoro007"
//       }
//     },
//     {
//       id: "ea7de161-adeb-4cfa-99e8-fb2da59b7c9c",
//       tournamentId: "ea7de161-adeb-4cfa-99e8-fb2da59b7c9c",
//       player1Id: "41e4936d-883a-4fc8-8009-c0995e6534f8",
//       player2Id: "1bb3cc0c-801f-491a-b172-d021a1921986",
//       player2FName: null,
//       player2LName: null,
//       player2Phone: null,
//       teamName: "Napoli Demons",
//       player1: {
//         firstName: "christian ",
//         lastName: "tezzi",
//         phone: "3513945619",
//         username: "chri"
//       },
//       player2: {
//         firstName: "Alberto",
//         lastName: "Giordano",
//         phone: "3334486190",
//         username: "JJR17"
//       }
//     },
//     {
//       id: "4597505c-712c-4b60-8792-4689123267ac",
//       tournamentId: "4597505c-712c-4b60-8792-4689123267ac",
//       player1Id: "5d1bda89-6101-4f6d-a3c2-7c3273beb607",
//       player2Id: "7499798a-2978-4145-b512-37f9922c2ef1",
//       player2FName: null,
//       player2LName: null,
//       player2Phone: null,
//       teamName: "I ludopatici",
//       player1: {
//         firstName: "Michele",
//         lastName: "Izzo",
//         phone: "3297514036",
//         username: "Izzo22"
//       },
//       player2: {
//         firstName: "Giuseppe ",
//         lastName: "Servodio ",
//         phone: "3886267071",
//         username: "Servodio "
//       }
//     },
//     {
//       id: "6bdfdf91-69ca-4db1-8528-2c2b7f58c9a3",
//       tournamentId: "6bdfdf91-69ca-4db1-8528-2c2b7f58c9a3",
//       player1Id: "2da77413-e82a-4134-bc55-55592fd61eb4",
//       player2Id: "8561e0ef-e650-468a-ae32-f97601b19ad9",
//       player2FName: null,
//       player2LName: null,
//       player2Phone: null,
//       teamName: "I Sinner",
//       player1: {
//         firstName: "Salvatore",
//         lastName: "Izzo",
//         phone: "3510913903",
//         username: "SalIzzo"
//       },
//       player2: {
//         firstName: "Gaetano",
//         lastName: "Ricci",
//         phone: "3791881749",
//         username: "Gaetano"
//       }
//     },
//     {
//       id: "f62d5929-56b5-48c8-a9c8-ef9f40983e8e",
//       tournamentId: "f62d5929-56b5-48c8-a9c8-ef9f40983e8e",
//       player1Id: "7cde3cdc-a166-462b-8b56-53c0a6b7b570",
//       player2Id: "174cb17d-cc31-40f9-8c10-daa9f5e5ac70",
//       player2FName: null,
//       player2LName: null,
//       player2Phone: null,
//       teamName: "I burloni",
//       player1: {
//         firstName: "Mariano",
//         lastName: "Pietropaolo",
//         phone: "3311029184",
//         username: "Almarian"
//       },
//       player2: {
//         firstName: "Gennaro",
//         lastName: "Carrano",
//         phone: "3388108996",
//         username: "Gennycarra2"
//       }
//     },
//     {
//       id: "c528281d-92f6-436d-9d28-9b1606787062",
//       tournamentId: "c528281d-92f6-436d-9d28-9b1606787062",
//       player1Id: "73ca3c38-28b1-44b0-9a4f-bb707678f00e",
//       player2Id: "c158ee76-01a9-45d6-8b75-d6ffb301f56b",
//       player2FName: null,
//       player2LName: null,
//       player2Phone: null,
//       teamName: "Gli AntAGOnisti",
//       player1: {
//         firstName: "Andrea",
//         lastName: "Passarella",
//         phone: "3338068052",
//         username: "Andrew16"
//       },
//       player2: {
//         firstName: "Agostino",
//         lastName: "Mollo",
//         phone: "3288692862",
//         username: "Ago18"
//       }
//     }
//   ]
// };

const mockTournamentDetail: TournamentResDto = {
    id: "79c5c3bf-8d06-4546-8998-52717682e402",
    title: "PadelFlash",
    description: "Evento in un unica serata per principianti avanzati e intermedi base",
    position: "Via atellana 65, Arzano",
    municipality: "Arzano",
    province: "Napoli",
    award: "100€",
    startsAt: new Date("2026-10-02T19:00:00.000Z"),
    endsAt: new Date("2026-10-02T22:00:00.000Z"),
    timezone: "Europe/Rome",
    maxTeams: 8,
    isClosed: false,
    isVisible: true,
    teams: [
        {
            id: "2a425f8a-1c7e-4a8b-9d99-760569f00ad1",
            tournamentId: "2a425f8a-1c7e-4a8b-9d99-760569f00ad1",
            player1Id: "2c2fe905-25ca-47bf-a032-eadb2ad7e72b",
            player2Id: "3955d201-4020-484f-a062-37c6a399e9e5",
            player2FName: null,
            player2LName: null,
            player2Phone: null,
            teamName: "Afuerax",
            player1: {
                firstName: "Carlo",
                lastName: "magno",
                phone: "+3932745562123",
                username: "il grande"
            },
            player2: {
                firstName: "Jim",
                lastName: "Tonson",
                phone: "+3932741562513",
                username: "Jox"
            }
        },
        {
            id: "d7a446cc-1914-4056-935f-aee8371b75c0",
            tournamentId: "d7a446cc-1914-4056-935f-aee8371b75c0",
            player1Id: "28146222-7373-48f7-9a14-026f22831677",
            player2Id: null,
            player2FName: "Mariano",
            player2LName: "Sapio",
            player2Phone: "+323271257547",
            teamName: "I Sinner",
            player1: {
                firstName: "pasquale",
                lastName: "Prinno",
                phone: "+393274517513",
                username: "Prinx"
            },
            player2: null
        },
        {
            id: "761ee25f-c6f0-475a-9a27-af31c62702d4",
            tournamentId: "761ee25f-c6f0-475a-9a27-af31c62702d4",
            player1Id: "51fbecfa-4bce-4014-bc82-1ddc6a770d9c",
            player2Id: "67181c84-400a-4c2a-b28e-9b44caeb5082",
            player2FName: null,
            player2LName: null,
            player2Phone: null,
            teamName: "I Campioni",
            player1: {
                firstName: "Luca",
                lastName: "Verdi",
                phone: "3214567448",
                username: "LucaVerdi"
            },
            player2: {
                firstName: "Mario",
                lastName: "Rossi",
                phone: "3214567458",
                username: "MarioRossi"
            }
        },
        {
            id: "e1917fc5-7fe6-4528-b0ff-8f7fea360024",
            tournamentId: "e1917fc5-7fe6-4528-b0ff-8f7fea360024",
            player1Id: "74c3d800-abf8-470d-bdc7-78cb74d8a10c",
            player2Id: "76bd8fca-2f4a-475d-85bb-a1b0d7d25b81",
            player2FName: null,
            player2LName: null,
            player2Phone: null,
            teamName: "smasher",
            player1: {
                firstName: "Simone",
                lastName: "Landolfi",
                phone: "+393278417513",
                username: "Simolfi"
            },
            player2: {
                firstName: "Luna",
                lastName: "Rossi",
                phone: "+3932741562313",
                username: "Lunax"
            }
        },
        {
            id: "4855192c-ee20-493f-be49-7951b3911106",
            tournamentId: "4855192c-ee20-493f-be49-7951b3911106",
            player1Id: "9281e323-cb0f-4a7d-83a0-17c0521df980",
            player2Id: "9850d25d-50f8-4cb3-a8e2-4589a0a0d616",
            player2FName: null,
            player2LName: null,
            player2Phone: null,
            teamName: "I Burloni",
            player1: {
                firstName: "Savio",
                lastName: "Torre",
                phone: "+3932145562123",
                username: "LaMuraglia"
            },
            player2: {
                firstName: "Alfredo",
                lastName: "Cangiano",
                phone: "+393274112513",
                username: "Alfred"
            }
        },
        {
            id: "7c0ad5be-78e7-4b12-bd5c-ca344c020380",
            tournamentId: "7c0ad5be-78e7-4b12-bd5c-ca344c020380",
            player1Id: "a64d490a-0fde-4e42-9dc3-af92adfd69af",
            player2Id: null,
            player2FName: "Alberto",
            player2LName: "Timoti",
            player2Phone: "+321271257547",
            teamName: "StrikStork",
            player1: {
                firstName: "Raffaela",
                lastName: "Giordy",
                phone: "+393278457511",
                username: "Raffy"
            },
            player2: null
        },
        {
            id: "6bd6001a-cf13-4552-b185-2d20c16a56ff",
            tournamentId: "6bd6001a-cf13-4552-b185-2d20c16a56ff",
            player1Id: "b6fdabd9-d6dd-4f4b-b771-8adde0bbed03",
            player2Id: "d15cb29d-1970-407a-b03e-7c2661d98b76",
            player2FName: null,
            player2LName: null,
            player2Phone: null,
            teamName: "Gli Ultimi",
            player1: {
                firstName: "Salvatore",
                lastName: "Felice",
                phone: "+3932745562313",
                username: "Felix"
            },
            player2: {
                firstName: "Francesca",
                lastName: "Giordy",
                phone: "+393278457513",
                username: "Kekka"
            }
        },
        {
            id: "49fcfe08-8315-4f47-ab65-ac014188c749",
            tournamentId: "49fcfe08-8315-4f47-ab65-ac014188c749",
            player1Id: "d2b42d7f-bdc8-49db-ad14-edf65d6254d1",
            player2Id: "debd25f5-04f1-4297-8399-72368f89db2e",
            player2FName: null,
            player2LName: null,
            player2Phone: null,
            teamName: "CampioniDiPadel",
            player1: {
                firstName: "Eduardo",
                lastName: "Pereposti",
                phone: "+393278457541",
                username: "Edox"
            },
            player2: {
                firstName: "Alberto",
                lastName: "Esposito",
                phone: "+393274113513",
                username: "albox"
            }
        }
    ]
};

// export const mocMatches: TournamentMatchResDto[] | null =  [
//     {
//       id: "c1f1552d-6798-40b8-84e7-b631965b8c2b",
//       tournamentId: "256dfa1a-e7b3-4cd8-8927-859c5c0e7080",
//       courtId: null,
//       courtName: null,
//       team1Id: "6bdfdf91-69ca-4db1-8528-2c2b7f58c9a3",
//       team2Id: "f62d5929-56b5-48c8-a9c8-ef9f40983e8e",
//       team1Name: "I Sinner",
//       team2Name: "I burloni",
//       format:  MatchFormat.SINGLE_SET,
//       winnerTeamId: "6bdfdf91-69ca-4db1-8528-2c2b7f58c9a3",
//       round: 1,
//       matchOrder: 1,
//       status: MatchStatus.COMPLETED,
//       scheduledAt: null,
//       sets: [
//         {
//           id: "a560989d-4e67-4309-8983-d732f95a2c72",
//           setNumber: 1,
//           team1Games: 6,
//           team2Games: 1,
//           tieBreak: false
//         }
//       ]
//     },
//     {
//       id: "ba28a862-b96f-4413-b24e-d8f986417077",
//       tournamentId: "256dfa1a-e7b3-4cd8-8927-859c5c0e7080",
//       courtId: null,
//       courtName: null,
//       team1Id: "83d21411-c1d3-4cc2-9d04-08635dea930a",
//       team2Id: "69808c4c-7fa6-4b25-b603-ef84205b5b77",
//       team1Name: "Mi-Teo",
//       team2Name: "Los peores",
//       format:  MatchFormat.SINGLE_SET,
//       winnerTeamId: "83d21411-c1d3-4cc2-9d04-08635dea930a",
//       round: 1,
//       matchOrder: 2,
//       status: MatchStatus.COMPLETED,
//       scheduledAt: null,
//       sets: [
//         {
//           id: "9c872adf-c367-4806-ae8e-41fa75fa3e44",
//           setNumber: 1,
//           team1Games: 6,
//           team2Games: 2,
//           tieBreak: false
//         }
//       ]
//     },
//     {
//       id: "a0999f5e-d50d-44a9-8c4c-5f83ff56671b",
//       tournamentId: "256dfa1a-e7b3-4cd8-8927-859c5c0e7080",
//       courtId: null,
//       courtName: null,
//       team1Id: "4597505c-712c-4b60-8792-4689123267ac",
//       team2Id: "c528281d-92f6-436d-9d28-9b1606787062",
//       team1Name: "I ludopatici",
//       team2Name: "Gli AntAGOnisti",
//       format:  MatchFormat.SINGLE_SET,
//       winnerTeamId: "4597505c-712c-4b60-8792-4689123267ac",
//       round: 1,
//       matchOrder: 3,
//       status: MatchStatus.COMPLETED,
//       scheduledAt: null,
//       sets: [
//         {
//           id: "7956f193-87ee-4f99-8ce9-86126f61b3c0",
//           setNumber: 1,
//           team1Games: 6,
//           team2Games: 1,
//           tieBreak: false
//         }
//       ]
//     },
//     {
//       id: "485c8fd5-e568-41f3-a45a-702c1a4efdee",
//       tournamentId: "256dfa1a-e7b3-4cd8-8927-859c5c0e7080",
//       courtId: null,
//       courtName: null,
//       team1Id: "ea7de161-adeb-4cfa-99e8-fb2da59b7c9c",
//       team2Id: "39d60df0-978c-4ee4-bd41-c2633304ceef",
//       team1Name: "Napoli Demons",
//       team2Name: "FC game",
//       format:  MatchFormat.SINGLE_SET,
//       winnerTeamId: "ea7de161-adeb-4cfa-99e8-fb2da59b7c9c",
//       round: 1,
//       matchOrder: 0,
//       status: MatchStatus.COMPLETED,
//       scheduledAt: null,
//       sets: [
//         {
//           id: "9756c5c1-37d9-4f6a-b968-ed25bbe62f99",
//           setNumber: 1,
//           team1Games: 5,
//           team2Games: 6,
//           tieBreak: true
//         }
//       ]
//     },
//     {
//       id: "88cc181d-5963-453c-9637-a5a12742b122",
//       tournamentId: "256dfa1a-e7b3-4cd8-8927-859c5c0e7080",
//       courtId: null,
//       courtName: null,
//       team1Id: "39d60df0-978c-4ee4-bd41-c2633304ceef",
//       team2Id: "6bdfdf91-69ca-4db1-8528-2c2b7f58c9a3",
//       team1Name: "FC game",
//       team2Name: "I Sinner",
//       format:  MatchFormat.SINGLE_SET,
//       winnerTeamId: "6bdfdf91-69ca-4db1-8528-2c2b7f58c9a3",
//       round: 2,
//       matchOrder: 0,
//       status: MatchStatus.COMPLETED,
//       scheduledAt: null,
//       sets: [
//         {
//           id: "d9bcc1e8-3f21-4f22-aff3-ade1a7dc1958",
//           setNumber: 1,
//           team1Games: 0,
//           team2Games: 6,
//           tieBreak: false
//         }
//       ]
//     },
//     {
//       id: "20816ab6-471b-4aa7-b4f7-48a2688ac063",
//       tournamentId: "256dfa1a-e7b3-4cd8-8927-859c5c0e7080",
//       courtId: null,
//       courtName: null,
//       team1Id: "83d21411-c1d3-4cc2-9d04-08635dea930a",
//       team2Id: "4597505c-712c-4b60-8792-4689123267ac",
//       team1Name: "Mi-Teo",
//       team2Name: "I ludopatici",
//       format:  MatchFormat.SINGLE_SET,
//       winnerTeamId: "83d21411-c1d3-4cc2-9d04-08635dea930a",
//       round: 2,
//       matchOrder: 1,
//       status: MatchStatus.COMPLETED,
//       scheduledAt: null,
//       sets: [
//         {
//           id: "12d6c25d-7bc7-4583-b915-18ec65a7611b",
//           setNumber: 1,
//           team1Games: 6,
//           team2Games: 5,
//           tieBreak: false
//         }
//       ]
//     },
//     {
//       id: "e088d613-dc35-4f71-99b8-073c91f8e4e5",
//       tournamentId: "256dfa1a-e7b3-4cd8-8927-859c5c0e7080",
//       courtId: null,
//       courtName: null,
//       team1Id: "6bdfdf91-69ca-4db1-8528-2c2b7f58c9a3",
//       team2Id: null,
//       team1Name: "I Sinner",
//       team2Name: null,
//       format:  MatchFormat.SINGLE_SET,
//       winnerTeamId: null,
//       round: 3,
//       matchOrder: 0,
//       status: MatchStatus.COMPLETED,
//       scheduledAt: null,
//       sets: []
//     }
//   ]

const  mocMatches: TournamentMatchResDto[] | null = [
    {
        id: "b2602223-3dec-48dd-9761-33bda41bca79",
        tournamentId: "79c5c3bf-8d06-4546-8998-52717682e402",
        courtId: null,
        courtName: null,
        team1Id: "6bd6001a-cf13-4552-b185-2d20c16a56ff",
        team1Name: "Gli Ultimi",
        team2Id: "7c0ad5be-78e7-4b12-bd5c-ca344c020380",
        team2Name: "StrikStork",
        winnerTeamId: null,
        round: 2,
        matchOrder: 1,
        format: MatchFormat.SINGLE_SET,
        status: MatchStatus.SCHEDULED,
        scheduledAt: null,
        sets: []
    },
    {
        id: "0283ac74-c86f-49c4-be4c-8a0e848cc492",
        tournamentId: "79c5c3bf-8d06-4546-8998-52717682e402",
        courtId: null,
        courtName: null,
        team1Id: "d7a446cc-1914-4056-935f-aee8371b75c0",
        team1Name: "I Sinner",
        team2Id: "49fcfe08-8315-4f47-ab65-ac014188c749",
        team2Name: "CampioniDiPadel",
        winnerTeamId: null,
        round: 2,
        matchOrder: 0,
        format: MatchFormat.SINGLE_SET,
        status: MatchStatus.SCHEDULED,
        scheduledAt: null,
        sets: []
    },
    {
        id: "2885da55-b6c2-46f8-a5e7-421001dc4715",
        tournamentId: "79c5c3bf-8d06-4546-8998-52717682e402",
        courtId: null,
        courtName: null,
        team1Id: null,
        team1Name: null,
        team2Id: null,
        team2Name: null,
        winnerTeamId: null,
        round: 3,
        matchOrder: 0,
        format: MatchFormat.SINGLE_SET,
        status: MatchStatus.SCHEDULED,
        scheduledAt: null,
        sets: []
    },
    {
        id: "0ce6f802-7fce-42fd-b06d-81d3849f3dc2",
        tournamentId: "79c5c3bf-8d06-4546-8998-52717682e402",
        courtId: "c71a1e6e-84ef-4ea0-b8c2-2c15d60ab358",
        courtName: "campo 3",
        team1Id: "49fcfe08-8315-4f47-ab65-ac014188c749",
        team1Name: "CampioniDiPadel",
        team2Id: "4855192c-ee20-493f-be49-7951b3911106",
        team2Name: "I Burloni",
        winnerTeamId: "49fcfe08-8315-4f47-ab65-ac014188c749",
        round: 1,
        matchOrder: 1,
        format: MatchFormat.SINGLE_SET,
        status: MatchStatus.COMPLETED,
        scheduledAt: null,
        sets: [
            {
                setNumber: 1,
                team1Games: 4,
                team2Games: 2,
                tieBreak: false
            }
        ]
    },
    {
        id: "a91791d9-672d-4e3c-b960-3fc9b83d8f63",
        tournamentId: "79c5c3bf-8d06-4546-8998-52717682e402",
        courtId: "795c6aab-83f0-4667-ad52-66051ff0b8f8",
        courtName: "campo 1",
        team1Id: "2a425f8a-1c7e-4a8b-9d99-760569f00ad1",
        team1Name: "Afuerax",
        team2Id: "d7a446cc-1914-4056-935f-aee8371b75c0",
        team2Name: "I Sinner",
        winnerTeamId: "d7a446cc-1914-4056-935f-aee8371b75c0",
        round: 1,
        matchOrder: 0,
        format: MatchFormat.SINGLE_SET,
        status: MatchStatus.COMPLETED,
        scheduledAt: null,
        sets: [
            {
                setNumber: 1,
                team1Games: 2,
                team2Games: 7,
                tieBreak: false
            }
        ]
    },
    {
        id: "266e05c5-36b1-4c91-b2d1-ab7ceab2eb1d",
        tournamentId: "79c5c3bf-8d06-4546-8998-52717682e402",
        courtId: "c71a1e6e-84ef-4ea0-b8c2-2c15d60ab358",
        courtName: "campo 3",
        team1Id: "761ee25f-c6f0-475a-9a27-af31c62702d4",
        team1Name: "I Campioni",
        team2Id: "6bd6001a-cf13-4552-b185-2d20c16a56ff",
        team2Name: "Gli Ultimi",
        winnerTeamId: "6bd6001a-cf13-4552-b185-2d20c16a56ff",
        round: 1,
        matchOrder: 2,
        format: MatchFormat.SINGLE_SET,
        status: MatchStatus.COMPLETED,
        scheduledAt: null,
        sets: [
            {
                setNumber: 1,
                team1Games: 3,
                team2Games: 7,
                tieBreak: false
            }
        ]
    },
    {
        id: "78b7004e-8c9d-46c8-957d-b2d47e9fc7ad",
        tournamentId: "79c5c3bf-8d06-4546-8998-52717682e402",
        courtId: "c71a1e6e-84ef-4ea0-b8c2-2c15d60ab358",
        courtName: "campo 3",
        team1Id: "7c0ad5be-78e7-4b12-bd5c-ca344c020380",
        team1Name: "StrikStork",
        team2Id: "e1917fc5-7fe6-4528-b0ff-8f7fea360024",
        team2Name: "smasher",
        winnerTeamId: "7c0ad5be-78e7-4b12-bd5c-ca344c020380",
        round: 1,
        matchOrder: 3,
        format: MatchFormat.SINGLE_SET,
        status: MatchStatus.IN_PROGRESS,
        scheduledAt: null,
        sets: [
        ]
    }
];


export default function AdminTournamentManagementPage() {
  const [tournament, setTournament] = useState<TournamentResDto | null>(null);
  const [matches, setMatches] = useState<Record<string, TournamentMatchResDto> | null>(null)
  const { id: tournamentId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);


  useEffect(() => {
      if (!tournamentId) return;
      apiClient.getTournament(tournamentId)
        .then(res => setTournament(res.Data ?? null))
        .catch(err => console.error("Errore dati torneo", err));

      apiClient.getMatches(tournamentId)
        .then(res => {
          if (res.IsSuccess && res.Data) {
            const recordMatches = RecordHelper.fromArrayByProperty(res.Data, "id")
            setMatches(recordMatches);
          }
        })
        .catch(err => console.error("Errore match", err));

      //DA LEVARE MOCK
      // setTournament(mockTournamentDetail);
      // if(mocMatches === null) return;
      // const recordMatches = RecordHelper.fromArrayByProperty(mocMatches, "id")
      // setMatches(recordMatches);
  }, []);


  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 relative">

      {/* Header Pannello Admin */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="gap-1 font-semibold uppercase tracking-wider text-[10px]">
              <ShieldAlert className="h-3 w-3" /> Area Riservata Admin
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Gestione Operativa: {tournament?.title}
          </h1>
          <p className="text-xs text-muted-foreground">
            Organizza i match in ordine di round, assegna le squadre e i campi, inserisci i set e finalizza i turni.
          </p>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors self-start md:self-auto px-3 py-1.5 rounded-md border border-border/40 bg-card cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Torna Indietro
        </button>
      </div>

      {/* Messaggi di feedback */}
      {successMsg && (
        <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Sezione Lista Partite ordinate */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" /> Elenco Match (Ordinati per Round e Ordine)
        </h2>

        <TournamentBracket
            matches={matches}
            setMatches={setMatches}
            tournamentId={tournamentId ?? null}
            editMode={{ teams: tournament?.teams ?? null}}
        />
      </div>
    </div>
  );
}