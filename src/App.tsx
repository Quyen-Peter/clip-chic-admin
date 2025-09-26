import React from 'react';
import './App.css';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from '../src/routes/AppRouter';


function App() {
  return (
    <BrowserRouter>
       <AppRouter/>
    </BrowserRouter>
  );
}

export default App;
