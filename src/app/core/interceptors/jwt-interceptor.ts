import { HttpInterceptorFn } from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('studyhub_token');
  if (token) {
    try {
      req = req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) });
    } catch (e) {
      
    }
  }

  return next(req);
};
