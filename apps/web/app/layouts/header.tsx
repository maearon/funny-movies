"use client";
import type { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/redux/hooks';
import { selectUser } from '@/redux/session/sessionSlice';
import { useLogout } from '@/components/shared/api/hooks/useLoginMutation';
import { useEffect, useState } from 'react';
// import { useInitSession } from '@/components/shared/api/hooks/useCurrentUser';

const Header: NextPage = () => {
  const router = useRouter();
  const { value: current_user, status } = useAppSelector(selectUser);
  const loading = status === "loading";
  const [hasMounted, setHasMounted] = useState(false)
  const logout = useLogout();

  useEffect(() => {
    setHasMounted(true)
  }, [])

  // useInitSession()

  const onClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    await logout();
  };

  return (
    <header className="navbar navbar-fixed-top navbar-inverse">
      <div className="container">
        <Link href="/" id="logo"><i className="fa fa-home"></i> Funny Movies</Link>
        <nav>
          <div className="navbar-header">
            <button type="button" className="navbar-toggle collapsed"
                    data-toggle="collapse"
                    data-target="#bs-example-navbar-collapse-1"
                    aria-expanded="false">
              <span className="sr-only">Toggle navigation</span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
            </button>
          </div>
          <ul className="nav navbar-nav navbar-right collapse navbar-collapse" id="bs-example-navbar-collapse-1">
            {loading ? (
              <li>Loading...</li>
            ) : current_user?.email ? (
              <>
                <li><Link href={`/users/${current_user.id}`}>{"Welcome " + current_user.email}</Link></li>
                <li className="divider"></li>
                <li><Link href="/share">
                  <div className="btn btn-primary">
                    Share a movie
                  </div>
                </Link></li>
                <li className="divider"></li>
                <li><Link href="#logout" onClick={onClick}>
                  <div className="btn btn-primary">
                    Logout
                  </div>
                </Link></li>
              </>
            ) : (
              <li><Link href="/login">
                <div className="btn btn-primary">
                  Login / Register
                </div>
              </Link></li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
