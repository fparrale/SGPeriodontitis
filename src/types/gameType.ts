
export interface GameStartResponse {
    status: number;
    message: string;
    data: Game;
}

export interface Game {
    id: string;
    user_id: string;
    group_id: string;
    status: string;
    grade: number;
    created_on: string;
    started_on: string;
    finished_on: string | null;
    lifes: number;
    total_answered: number;
    total_questions: number;
}