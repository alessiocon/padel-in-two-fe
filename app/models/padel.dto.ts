export class RecoveryDto{
    team: string;
    points: number[];
    hit: number[];
    round: number; 
    loses: boolean;
} 

export class PadelDto {
    name: string;
    location: string;
    startDate: Date;
    teams: string[];
    round: RoundDto[];
    gironi: [string | null, string | null][];
    gironiCount: number;
    recovery: RecoveryDto[];
}

export class PadelDtoId extends PadelDto {
    _id: string;
}

export class RoundDto {
    teamA: string;
    teamB: string;
    campo: number;
    start?: Date;
    end?: Date;
    status: string;
    rental: number[];
    matchFor: "girone" | "safe";
    matchForPosition?: [number, number];
    match: [number,number][];
}

export type MatchDto = [number, number]; 

export type MatchAddDto = {
    pointSq1: number;
    pointSq2: number;
    sq1: string;
    sq2: string;
    roundIndex: number;
}