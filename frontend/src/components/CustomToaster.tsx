import { Toaster } from 'react-hot-toast'

interface CustomToasterProps {
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
}

export const CustomToaster = ({ position = 'top-right' }: CustomToasterProps) => {
  return (
    <Toaster
      position={position}
      toastOptions={{
        duration: 4000,
        style: {
          background: '#363636',
          color: '#fff',
          cursor: 'pointer',
          paddingRight: '40px',
          position: 'relative',
        },
        success: {
          duration: 4000,
          iconTheme: {
            primary: '#10B981', // Green icon
            secondary: '#fff',
          },
          style: {
            background: '#ffffff', // White background
            color: '#10B981', // Green text
            border: '2px solid #10B981', // Green border
            cursor: 'pointer',
            paddingRight: '40px',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)', // Green shadow
          },
        },
        error: {
          duration: 5000,
          iconTheme: {
            primary: '#EF4444',
            secondary: '#fff',
          },
          style: {
            background: '#991b1b',
            color: '#fff',
            cursor: 'pointer',
            paddingRight: '40px',
          },
        },
        loading: {
          duration: Infinity,
          iconTheme: {
            primary: '#f97316',
            secondary: '#fff',
          },
        },
      }}
      containerStyle={{
        top: 20,
        right: 20,
      }}
    />
  )
}

export default CustomToaster