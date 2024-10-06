import { useState } from 'react'; // useStateをインポート  
import { signIn, signOut, useSession } from 'next-auth/react';  
import Link from 'next/link';  
import CustomButton from './Custom_Button';

const Header = () => {  
  const { data: session } = useSession();  
  const [showLogout, setShowLogout] = useState(false);  // ログアウトボタンの表示/非表示の状態  

  return (  
    <header className="fixed top-0 left-0 w-full bg-blue-500 text-black px-4 py-2 shadow-md z-50">  
      <div className="mx-auto flex justify-between items-center max-w-screen-sm relative">  
        {/* ロゴ部分 */}  
        <div>  
          <Link href="/">  
            <CustomButton text="出欠一覧" color="blue" size="large" />
          </Link>  
        </div>  

        {/* メニュー部分 */}  
        <nav>  
          <ul className="flex space-x-2 sm:space-x-4">  
            <li>  
              <Link href="/whiteboard">  
                <CustomButton text="ホワイトボード" color="blue" size="large"/>
              </Link>  
            </li>  
          </ul>  
        </nav>  

        {/* アカウント設定部分 */}  
        <div className="relative">  
          {session ? (  
            <div className="flex items-center space-x-2 sm:space-x-4">  
              <img  
                src={session.user?.image || ''}  
                alt="User Image"  
                className="w-8 h-8 rounded-full cursor-pointer"  
                onClick={() => setShowLogout(!showLogout)}  
              />
              {showLogout && (  
                <div className="absolute top-full right-0 mt-2 bg-red-500 hover:bg-red-600 shadow-lg rounded z-50 p-2 transition-transform transform origin-top animate-dropdown">  
                  <button  
                    onClick={() => signOut()}  
                    className="block px-10 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"  
                  >  
                    Logout
                  </button>  
                </div>  
              )}  
            </div>  
          ) : (  
            <button  
              onClick={() => signIn()}  
              className="bg-green-500 px-3 py-2 rounded hover:bg-green-600 text-sm sm:text-base"  
            >  
              ログイン  
            </button>  
          )}  
        </div>  
      </div>  

      <style jsx>{`  
        .animate-dropdown {  
          animation: dropdown 0.3s ease-out forwards;  
        }  

        @keyframes dropdown {  
          0% {  
            transform: scaleY(0);  
            opacity: 0;  
          }  
          100% {  
            transform: scaleY(1);  
            opacity: 1;  
          }  
        }  
      `}</style>  
    </header>  
  );  
};  

export default Header;