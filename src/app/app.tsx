import styled from '@emotion/styled';
import { Route, Routes } from 'react-router-dom';
import { Home } from './Home';
import { PokemonDetail } from './PokemonDetail';
import { css, Global } from '@emotion/react';



const StyledApp = styled.div`
  // Your style here
`;


export function App() {
  return (
    <StyledApp >
      <Global
        styles={css`
        body {
          background-image: url(${process.env.PUBLIC_URL}/assets/background.jpg)
        }
      `}
      />
      <div id="main">
        <h1>Who's That Pokémon?</h1>
        <Routes>
          <Route path='/' Component={Home} />
          <Route path='/:id' Component={PokemonDetail} />
        </Routes>
      </div>
    </StyledApp>
  );
}

export default App;
