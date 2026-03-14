import { BrowserRouter, Routes, Route } from "react-router-dom"   // importa sistema de rotas do React Router

import Home from "./pages/Home/Home"                                   // importa página Home
import ProductPage from "./pages/ProductPage/productPage"                     // importa página dinâmica de produto

function App() {                                                  // componente principal da aplicação

  return (

    <BrowserRouter>                                               {/* ativa o sistema de navegação */}

      <Routes>                                                    {/* container que guarda todas as rotas */}

        <Route path="/" element={<Home />} />                     {/* rota da página inicial */}

        <Route path="/produto/:slug" element={<ProductPage />} /> {/* rota dinâmica (:slug = variável da URL) */}

      </Routes>

    </BrowserRouter>

  )

}

export default App                                               // exporta componente