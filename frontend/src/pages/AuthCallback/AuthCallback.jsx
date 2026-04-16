import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

function AuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    const storeId = searchParams.get('storeId')
    const isNew = searchParams.get('isNew')

    if (token) {
      // Armazenar token no localStorage
      localStorage.setItem('authToken', token)
      localStorage.setItem('storeId', storeId)
      
      console.log('✅ Token armazenado com sucesso!')
      console.log('Store ID:', storeId)
      console.log('Nova integração:', isNew)
      
      // Redirecionar para home depois de 1 segundo
      setTimeout(() => {
        navigate('/')
      }, 1000)
    } else {
      console.error('❌ Token não encontrado na URL')
      navigate('/')
    }
  }, [searchParams, navigate])

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '18px',
      color: '#666'
    }}>
      <p>Processando autenticação... Redirecionando...</p>
    </div>
  )
}

export default AuthCallback
