import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StressQuestionnaireComponent } from './stress-questionnaire/stress-questionnaire';

export const routes: Routes = [
  { path: '', redirectTo: 'cuestionario', pathMatch: 'full' },
  { path: 'cuestionario', component: StressQuestionnaireComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}