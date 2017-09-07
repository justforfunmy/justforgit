import { Component, OnInit,Inject } from '@angular/core';
import {Todo} from './todo.model'

@Component({
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css']
})
export class TodoComponent implements OnInit {
  todos:Todo[] = [];
  desc = '';
  constructor(@Inject('todoService') private service) { }

  ngOnInit() {
  }

  addTodo(){
    this.service.addTodo(this.desc).then(res=>{
      this.todos = [...this.todos,res];
      this.desc=''
    })
  }

  onTextChanges(value) {
    this.desc = value;
   }

  toggleTodo(todo: Todo) {
    const i = this.todos.indexOf(todo);
    this.service
      .toggleTodo(todo)
      .then(t => {
        this.todos = [
          ...this.todos.slice(0,i),
          t,
          ...this.todos.slice(i+1)
          ];
      });
  }
  removeTodo(todo: Todo) {
    const i = this.todos.indexOf(todo);
    this.service
      .deleteTodoById(todo.id)
      .then(()=> {
        this.todos = [
          ...this.todos.slice(0,i),
          ...this.todos.slice(i+1)
        ];
      });
  }
  getTodos(): void {
    this.service
      .getTodos()
      .then(todos => this.todos = [...todos]);
  }



}
