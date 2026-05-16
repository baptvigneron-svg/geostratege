"use client";

import { useState } from "react";
import type { QuizQuestion } from "@/lib/articles";

type Props = { questions: QuizQuestion[] };

type AnswerState = {
  selected: number | null;
  confirmed: boolean;
};

export default function Quiz({ questions }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerState[]>(
    questions.map(() => ({ selected: null, confirmed: false }))
  );
  const [finished, setFinished] = useState(false);
  const [key, setKey] = useState(0); // force re-render for animation

  const current = questions[currentIndex];
  const currentAnswer = answers[currentIndex];

  const handleSelect = (idx: number) => {
    if (currentAnswer.confirmed) return;
    setAnswers((prev) =>
      prev.map((a, i) => (i === currentIndex ? { ...a, selected: idx } : a))
    );
  };

  const handleConfirm = () => {
    if (currentAnswer.selected === null) return;
    setAnswers((prev) =>
      prev.map((a, i) => (i === currentIndex ? { ...a, confirmed: true } : a))
    );
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setKey((k) => k + 1);
      setCurrentIndex((i) => i + 1);
    } else {
      setFinished(true);
    }
  };

  const score = answers.filter(
    (a, i) => a.confirmed && a.selected === questions[i].bonneReponse
  ).length;

  if (finished) {
    return <ScoreScreen score={score} total={questions.length} answers={answers} questions={questions} onRetry={() => {
      setAnswers(questions.map(() => ({ selected: null, confirmed: false })));
      setCurrentIndex(0);
      setFinished(false);
      setKey((k) => k + 1);
    }} />;
  }

  return (
    <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">
          Quiz de compréhension
        </h3>
        <span className="text-sm text-gray-500">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-gray-800 rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-500"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div key={key} className="quiz-slide">
        <p className="text-base sm:text-lg font-medium text-white mb-6 leading-relaxed">
          {current.question}
        </p>

        {/* Choices */}
        <div className="grid gap-3">
          {current.choix.map((choix, idx) => {
            const isSelected = currentAnswer.selected === idx;
            const isCorrect = idx === current.bonneReponse;
            const isConfirmed = currentAnswer.confirmed;

            let className =
              "w-full text-left px-4 py-3.5 rounded-xl border text-sm transition-all duration-200 ";

            if (!isConfirmed) {
              className += isSelected
                ? "border-blue-500 bg-blue-500/15 text-white"
                : "border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600 hover:bg-gray-800";
            } else {
              if (isCorrect) {
                className += "border-green-500 bg-green-500/15 text-green-300";
              } else if (isSelected && !isCorrect) {
                className += "border-red-500 bg-red-500/15 text-red-300";
              } else {
                className += "border-gray-800 bg-gray-900/50 text-gray-500";
              }
            }

            return (
              <button key={idx} onClick={() => handleSelect(idx)} className={className}>
                <span className="flex items-start gap-3">
                  <span className={`flex-shrink-0 w-6 h-6 rounded-full border text-xs flex items-center justify-center font-bold transition-colors ${
                    !isConfirmed && isSelected
                      ? "border-blue-500 bg-blue-500 text-white"
                      : isConfirmed && isCorrect
                      ? "border-green-500 bg-green-500 text-white"
                      : isConfirmed && isSelected && !isCorrect
                      ? "border-red-500 bg-red-500 text-white"
                      : "border-gray-600 text-gray-500"
                  }`}>
                    {["A", "B", "C", "D"][idx]}
                  </span>
                  {choix}
                </span>
              </button>
            );
          })}
        </div>

        {/* Explanation after confirm */}
        {currentAnswer.confirmed && (
          <div className="mt-5 p-4 rounded-xl bg-blue-900/20 border border-blue-800/40 quiz-fade">
            <p className="text-sm text-blue-300 leading-relaxed">
              <span className="font-semibold">Explication :</span>{" "}
              {current.explication}
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 mt-6 justify-end">
          {!currentAnswer.confirmed ? (
            <button
              onClick={handleConfirm}
              disabled={currentAnswer.selected === null}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
            >
              Valider
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2"
            >
              {currentIndex < questions.length - 1 ? "Question suivante" : "Voir les résultats"}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ScoreScreen({
  score,
  total,
  answers,
  questions,
  onRetry,
}: {
  score: number;
  total: number;
  answers: AnswerState[];
  questions: QuizQuestion[];
  onRetry: () => void;
}) {
  const percentage = Math.round((score / total) * 100);

  const label =
    percentage >= 80
      ? { text: "Excellent !", color: "text-green-400" }
      : percentage >= 60
      ? { text: "Bien joué !", color: "text-blue-400" }
      : percentage >= 40
      ? { text: "Peut mieux faire.", color: "text-yellow-400" }
      : { text: "À revoir…", color: "text-red-400" };

  return (
    <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6 sm:p-8 quiz-fade">
      {/* Score */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-blue-500 mb-4">
          <span className="text-3xl font-bold text-white">
            {score}/{total}
          </span>
        </div>
        <h3 className={`text-2xl font-bold ${label.color}`}>{label.text}</h3>
        <p className="text-gray-400 mt-1 text-sm">{percentage} % de bonnes réponses</p>
      </div>

      {/* Detailed corrections */}
      <div className="space-y-4 mb-8">
        {questions.map((q, i) => {
          const a = answers[i];
          const correct = a.selected === q.bonneReponse;
          return (
            <div
              key={i}
              className={`rounded-xl p-4 border ${
                correct
                  ? "border-green-800/50 bg-green-900/10"
                  : "border-red-800/50 bg-red-900/10"
              }`}
            >
              <div className="flex items-start gap-2 mb-2">
                <span className="text-lg">{correct ? "✅" : "❌"}</span>
                <p className="text-sm font-medium text-white leading-snug">{q.question}</p>
              </div>
              {!correct && a.selected !== null && (
                <p className="text-xs text-red-400 ml-7 mb-1">
                  Votre réponse : {q.choix[a.selected]}
                </p>
              )}
              <p className="text-xs text-green-400 ml-7 mb-2">
                Bonne réponse : {q.choix[q.bonneReponse]}
              </p>
              <p className="text-xs text-gray-400 ml-7 leading-relaxed">{q.explication}</p>
            </div>
          );
        })}
      </div>

      <button
        onClick={onRetry}
        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors"
      >
        Recommencer le quiz
      </button>
    </div>
  );
}
