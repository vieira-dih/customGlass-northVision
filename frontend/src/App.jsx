import { BrowserRouter, Routes, Route } from "react-router-dom"   // importa sistema de rotas do React Router

import Home from "./pages/Home/Home"                                   // importa página Home
import ProductPage from "./pages/ProductPage/productPage"                     // importa página dinâmica de produto
import AuthCallback from "./pages/AuthCallback/AuthCallback"           // importa página de callback OAuth
import Admin from "./pages/Admin/Admin"                                // área restrita do lojista (legado)
import LojistaLogin from "./pages/Lojista/LojistaLogin"               // login do lojista
import LojistaAdmin from "./pages/Lojista/LojistaAdmin"               // painel do lojista

function App() {                                                  // componente principal da aplicação

  return (

    <BrowserRouter>                                               {/* ativa o sistema de navegação */}

      <Routes>                                                    {/* container que guarda todas as rotas */}

        <Route path="/" element={<Home />} />                     {/* rota da página inicial */}

        <Route path="/auth-callback" element={<AuthCallback />} />{/* rota de callback OAuth */}

        <Route path="/produto/:slug" element={<ProductPage />} /> {/* rota dinâmica (:slug = variável da URL) */}

        <Route path="/admin" element={<Admin />} />               {/* área do lojista - não exposta ao cliente */}

        <Route path="/lojista/login" element={<LojistaLogin />} />{/* login do lojista */}

        <Route path="/lojista/admin" element={<LojistaAdmin />} />{/* painel do lojista (protegido) */}

      </Routes>

    </BrowserRouter>

  )

}

export default App                                               // exporta componente