import { Routes } from '@angular/router';

import { vueloComponent } from './vuelo.component';

export const vueloRoutes: Routes = [
  {
    path: '',
    component: vueloComponent,
	data: {
      title: 'vuelo Page',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'vuelo Page' }
      ]
    }
  }
];
