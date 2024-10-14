import './App.css'
import './components/Web3/Web3'
// import SignUp from './components/signUpPage/SignUp'
import SSignUp from './components/actualSignUp/SSignUp'
import Dashboard from './components/dashboard/Dashboard'
import { Web3Provider } from './components/Web3/Web3'
import { PeerLinkProvider } from './components/appContext/peerLinkContext/PeerLinkContext'
// import CredBalance from './components/credBalance/CredBalance'

function App() {
  return (
    <>

      <Web3Provider>
        {/* < SignUp />

        <CredBalance /> */}
        <PeerLinkProvider >
          <Dashboard />
        </PeerLinkProvider>
        <>
        </>
      </Web3Provider>
    </>
  )
}

export default App
