import React from 'react';
import { Route } from 'react-router-dom';
import NewRegister from '@/pages/register/NewRegister';
import Cooperados from '../pages/cooperative/Cooperados';

export const registerRoutes = (
  <>
    <Route path="/register/new" element={<NewRegister />} />
    <Route path="/new-register" element={<NewRegister />} />
    <Route path="/cooperativa/cooperados" element={<Cooperados />} />
  </>
); 