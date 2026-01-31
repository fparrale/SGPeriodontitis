export interface QuestionResponse {
  success: boolean;
  data: Question[];
}


export interface Question {
  id: string;
  title: string;
  description: string;
  type: string;
  tip_note: string;
  created_on: string;
  ai_generated: boolean;
  lang: string;
  feedback: string;
  status: string;
  options: QuestionOption[];
}


export interface QuestionOption {
  text_option: string;
  is_correct: 0 | 1;
}


export interface GroupQuestionStats {
  id: string;
  group_id: string;
  question_id: string;
  total_answers: number;
  correct_answers: number;
  incorrect_answers: number;
  avg_response_time: number;   // decimal(10,2)
  total_time: number;          // decimal(10,2)
  accuracy: number;            // decimal(5,2)
  created_on: string;          // fecha en formato ISO
  updated_on: string;          // fecha en formato ISO
  opt_a: number;
  opt_b: number;
  opt_c: number;
  opt_d: number;
  correct_option_letter: string;
}