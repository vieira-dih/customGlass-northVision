import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

function AuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('loading')
  const [mensagem, setMensagem] = useState('Processando autenticação...')

  useEffect(() => {
    const token = searchParams.get('token')
    const storeId = searchParams.get('storeId')
    const isNew = searchParams.get('isNew')
    const error = searchParams.get('error')

    if (error) {
      setStatus('error')
      setMensagem(`Erro na autenticação: ${error}`)
      setTimeout(() => navigate('/'), 3000)
      return
    }

    if (token) {
      localStorage.setItem('authToken', token)
      localStorage.setItem('storeId', storeId)
      
      console.log('✅ Token armazenado com sucesso!')
      console.log('Store ID:', storeId)
      
      setStatus('success')
      setMensagem(isNew === 'true' 
        ? 'Loja conectada com sucesso! Redirecionando...'
        : 'Token atualizado com sucesso! Redirecionando...'
      )
      
      setTimeout(() => navigate('/'), 2000)
    } else {
      setStatus('error')
      setMensagem('Token não encontrado. Redirecionando...')
      setTimeout(() => navigate('/'), 2000)
    }
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
