// ======================================================
// Arquivo: pages/AuthCallback/AuthCallback.jsx
// ======================================================
// Pagina que recebe o retorno do OAuth da Nuvemshop.
// Captura code/store_id da Nuvemshop, chama backend para processar,
// recebe token/storeId, salva no localStorage e volta para Home.
// ======================================================

import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

function AuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('loading')
  const [mensagem, setMensagem] = useState('Processando autenticação...')

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Parametros que podem vir:
        // 1. Do Nuvemshop: code, store_id
        // 2. Do backend (redirect): token, storeId, isNew
        
        const code = searchParams.get('code')
        const store_id = searchParams.get('store_id')
        const token = searchParams.get('token')
        const storeId = searchParams.get('storeId')
        const isNew = searchParams.get('isNew')
        const error = searchParams.get('error')

        // Erro vindo do backend
        if (error) {
          setStatus('error')
          setMensagem(`Erro na autenticação: ${error}`)
          setTimeout(() => navigate('/'), 3000)
          return
        }

        // Se tem token (vindo do backend), salvar e redirecionar
        if (token) {
          localStorage.setItem('authToken', token)
          localStorage.setItem('storeId', storeId)
          
          console.log('✅ Token armazenado com sucesso!')
          console.log('Store ID:', storeId)
          
          setStatus('success')
          setMensagem(isNew === 'true' 
            ? '✅ Loja conectada com sucesso! Redirecionando...'
            : '✅ Token atualizado com sucesso! Redirecionando...'
          )
          
          setTimeout(() => navigate('/'), 2000)
          return
        }

        // Se tem code (vindo da Nuvemshop), chamar backend para processar
        if (code) {
          console.log('🔄 Recebido code da Nuvemshop, enviando para backend...')
          setMensagem('Processando autorização da Nuvemshop...')
          
          // Chamar backend para processar o code
          const response = await fetch(`http://localhost:3000/auth/callback?code=${code}&store_id=${store_id}`)
          
          if (!response.ok) {
            throw new Error(`Erro ao processar callback: ${response.status}`)
          }
          
          // O backend retorna HTML com redirect automático
          // Mas se chegou aqui, vamos extrair a URL de redirect do HTML
          const html = await response.text()
          
          // Extrair URL de redirect do JavaScript no HTML
          const urlMatch = html.match(/window\.location\.href = "(.+?)";/)
          if (urlMatch && urlMatch[1]) {
            console.log('🔄 Redirecionando para:', urlMatch[1])
            window.location.href = urlMatch[1]
          } else {
            throw new Error('Não foi possível extrair URL de redirect')
          }
          return
        }

        // Se chegou aqui sem token ou code
        setStatus('error')
        setMensagem('Nenhum parâmetro de autenticação encontrado. Redirecionando...')
        setTimeout(() => navigate('/'), 2000)
      } catch (err) {
        console.error('❌ Erro ao processar callback:', err)
        setStatus('error')
        setMensagem(`Erro: ${err.message}`)
        setTimeout(() => navigate('/'), 3000)
      }
    }

    processCallback()
  }, [searchParams, navigate])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: '#111',
      color: 'white',
      fontFamily: 'sans-serif',
    }}>
      <div style={{
        background: '#1a1a1a',
        padding: '40px 60px',
        borderRadius: '12px',
        textAlign: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>
          {status === 'loading' && '⏳'}
          {status === 'success' && '✅'}
          {status === 'error' && '❌'}
        </div>
        <h2 style={{ marginBottom: '8px' }}>
          {status === 'loading' && 'Conectando...'}
          {status === 'success' && 'Conectado!'}
          {status === 'error' && 'Erro'}
        </h2>
        <p style={{ color: '#999', fontSize: '16px' }}>{mensagem}</p>
      </div>
    </div>
  )
}

export default AuthCallback
