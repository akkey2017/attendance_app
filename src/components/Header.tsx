import { signIn, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

const Header = () => {
    const { data: session } = useSession();

    return (
        <header className="fixed top-0 left-0 w-full bg-blue-500 text-black p-4 shadow-md z-50">
            <div className="container mx-auto flex justify-between items-center">
                {/* ロゴ部分 */}
                <div>
                    <Link href="/">
                        <button className="bg-white px-4 py-2 rounded hover:bg-gray-100">
                            出欠一覧
                        </button>
                    </Link>
                </div>

                {/* メニュー部分 */}
                <nav>
                    <ul className="flex space-x-4">
                        <li>
                            <Link href="/whiteboard">
                                <button className="bg-white px-4 py-2 rounded hover:bg-gray-100">
                                ホワイトボード
                                </button>
                            </Link>
                        </li>
                        {/* 他のページのリンクもここに追加可能 */}
                    </ul>
                </nav>

                {/* アカウント設定部分 */}
                <div>
                    {session ? (
                        <div className="flex items-center space-x-4">
                            <img
                                src={session.user?.image || ''}
                                alt="User Image"
                                className="w-8 h-8 rounded-full"
                            />
                            <button
                                onClick={() => signOut()}
                                className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
                            >
                                ログアウト
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => signIn()}
                            className="bg-green-500 px-4 py-2 rounded hover:bg-green-600"
                        >
                            ログイン
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
