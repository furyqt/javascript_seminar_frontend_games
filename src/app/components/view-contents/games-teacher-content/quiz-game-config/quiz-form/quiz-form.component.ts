import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormArray, Validators, FormControl } from '@angular/forms';
import { Quiz } from '@app/models/game-models/quiz';
import { Question } from '@app/models/game-models/question';
import { ReplaySubject, Subject } from 'rxjs';
import { MatSelect } from '@angular/material/select';
import { take, takeUntil } from 'rxjs/operators';

interface QuestionGroup {
  type: string;
  questions: Question[]
}

@Component({
  selector: 'app-quiz-form',
  templateUrl: './quiz-form.component.html',
  styleUrls: ['./quiz-form.component.less']
})


export class QuizFormComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() game: Quiz;
  @Input() allQuestions: Question[];
  @Output() quizChange: EventEmitter<Quiz> = new EventEmitter<Quiz>();

  questionGroups: QuestionGroup[] = [];

  quiz = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    questions: this.fb.array([])
  })

  public questGroupsCtrl: FormControl = new FormControl();
  public questGroupsFilterCtrl: FormControl = new FormControl();
  public filteredQuestGroups: ReplaySubject<QuestionGroup[]> = new ReplaySubject<QuestionGroup[]>(1);

  @ViewChild('multiSelect', { static: true }) multiSelect: MatSelect;

  protected _onDestroy = new Subject<void>();

  constructor(private fb: FormBuilder) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['game']) {
      this.updateGame(changes.game.currentValue);
    }
    if (changes['allQuestions']) {
      this.updateQuestions(changes.allQuestions.currentValue)
    }
  }

  ngOnInit(): void {
    this.quiz.patchValue({
      name: this.game.name,
      description: this.game.description
    })
    //group questions by type
    let matchQs = { type: 'match', questions: [] };
    let selectQs = { type: 'select', questions: [] };
    this.allQuestions.forEach(q => {
      if (q.type == 'match') {
        matchQs.questions.push(q);
      } else selectQs.questions.push(q);
    });
    this.questionGroups.push(matchQs);
    this.questionGroups.push(selectQs);
    //set initial selected questions of quiz
    let qs = [];
    this.game.questions.forEach(questId => {
      let q = this.allQuestions.find(elem => elem._id === questId);
      if (q) qs.push(q);
    });
    this.questGroupsCtrl.setValue(qs);
    this.filteredQuestGroups.next(this.copyQuestGroups(this.questionGroups));
    this.questGroupsFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterQuestGroups();
      })
  }

  ngAfterViewInit() {
    this.setInitialValue();
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  protected setInitialValue() {
    this.filteredQuestGroups
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        this.multiSelect.compareWith = (a: Question, b: Question) => a && b && a._id === b._id;
      });
  }

  addQuestion(questionId = '') {
    this.questions.push(this.fb.control(questionId));
  }

  removeQuestion(index) {
    this.questions.removeAt(index);
    if (this.questions.length == 0) {
      this.addQuestion();
    }
  }

  get questions() {
    return this.quiz.get('questions') as FormArray;
  }

  getQuestionsIds(questions) {
    return questions.map(quest => quest._id);
  }

  onSubmit() {
    let ids = this.getQuestionsIds(this.questGroupsCtrl.value);
    this.questions.clear();
    ids.forEach(id => {
      this.addQuestion(id);
    });
    let updated = this.quiz.value;
    updated._id = this.game._id;
    this.quizChange.emit(updated);
  }

  updateQuestions(update: Question[]) {
    console.log("question update")
  }

  updateGame(update: Quiz) {
    console.log("quiz update")
    /*    this.quiz.patchValue({
         name: update.name,
         description: update.description
       }) */
    /*  this.questions.clear();
     update.questions.forEach(questionId => {
       this.addQuestion(questionId)
     });
     if (this.questions.length == 0) {
       this.addQuestion();
     } */
  }

  protected filterQuestGroups() {
    if (!this.questionGroups) {
      return;
    }
    // get the search keyword
    let search = this.questGroupsFilterCtrl.value;
    const questGroupsCopy = this.copyQuestGroups(this.questionGroups);
    if (!search) {
      this.filteredQuestGroups.next(questGroupsCopy);
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the questions
    this.filteredQuestGroups.next(
      questGroupsCopy.filter(questGroup => {
        const showQuestGroup = questGroup.name.toLowerCase().indexOf(search) > -1;
        if (!showQuestGroup) {
          questGroup.banks = questGroup.banks.filter(
            bank => bank.name.toLowerCase().indexOf(search) > -1
          );
        }
        return questGroup.banks.length > 0;
      })
    );
  }
  protected copyQuestGroups(questGroups: QuestionGroup[]) {
    const questGroupsCopy = [];
    questGroups.forEach(questGroup => {
      questGroupsCopy.push({
        type: questGroup.type,
        questions: questGroup.questions.slice()
      });
    });
    return questGroupsCopy;
  }
}
