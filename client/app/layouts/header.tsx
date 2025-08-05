"use client";
import type { NextPage } from 'next';
import Link from 'next/link';
import { fetchUser, selectUser } from '../../redux/session/sessionSlice';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import sessionApi from '../../components/shared/api/sessionApi';
import flashMessage from '@/components/shared/flashMessages';

const Header: NextPage = () => {
  const router = useRouter();
  const current_user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dispatch(fetchUser()).finally(() => setLoading(false));
  }, [dispatch]);
  
  useEffect(() => {
    if (!loading && current_user?.value?.email) {
      router.push("/");
    }
  }, [loading, current_user?.value?.email, router]);

  const onClick = async (e: any) => {
    e.preventDefault();
    
    try {
      // Call the API to destroy the session
      const response = await sessionApi.destroy();
      
      // Always clear local and session storage
      localStorage.removeItem("token");
      localStorage.removeItem("remember_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("accessToken");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("remember_token");
      sessionStorage.removeItem("refresh_token");
      sessionStorage.removeItem("accessToken");
      await dispatch(fetchUser()); // Fetch user data if needed
  
      // Check the response status
      if (response.status === 401) {
        flashMessage("error", "Unauthorized")
      }
      
      // Redirect to home page
      router.push("/");
    } catch (error) {
      // Handle error and show flash message
      flashMessage("error", "Logout error: " + error);
      // Always clear local and session storage
      localStorage.removeItem("token");
      localStorage.removeItem("remember_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("accessToken");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("remember_token");
      sessionStorage.removeItem("refresh_token");
      sessionStorage.removeItem("accessToken");
      await dispatch(fetchUser()); // Fetch user data if needed
  
      // Check the response status
      flashMessage("error", "Unauthorized")
    }
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
            ) : current_user?.value?.email ? (
              <>
                <li><Link href={`/users/${current_user.value.id}`}>{"Welcome " + current_user.value.email}</Link></li>
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
