"use client";
import type { NextPage } from "next";
import Link from "next/link";
import { useAppSelector } from "@/redux/hooks";
import { selectUser } from "@/redux/session/sessionSlice";
import { useLogout } from "@/components/shared/api/hooks/useLoginMutation";
import { useEffect, useState } from "react";

const Header: NextPage = () => {
  const { value: current_user, status } = useAppSelector(selectUser);
  const loading = status === "loading";
  const [hasMounted, setHasMounted] = useState(false);
  const logout = useLogout();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const onClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    await logout();
  };

  if (!hasMounted) {
    return (
      <header className="navbar navbar-fixed-top navbar-inverse">
        <div className="container">
          <div className="navbar-header">
            <Link href="/" className="navbar-brand" id="logo">
              <i className="fa fa-home" /> Funny Movies
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="navbar navbar-fixed-top navbar-inverse">
      <div className="container">
        <div className="navbar-header">
          <button
            type="button"
            className="navbar-toggle collapsed"
            data-toggle="collapse"
            data-target="#main-navbar-collapse"
            aria-expanded="false"
          >
            <span className="sr-only">Toggle navigation</span>
            <span className="icon-bar" />
            <span className="icon-bar" />
            <span className="icon-bar" />
          </button>
          <Link href="/" className="navbar-brand" id="logo">
            <i className="fa fa-home" /> Funny Movies
          </Link>
        </div>
        <div className="collapse navbar-collapse" id="main-navbar-collapse">
          <ul className="nav navbar-nav navbar-right">
            {loading ? (
              <li>
                <p className="navbar-text">Loading...</p>
              </li>
            ) : current_user?.email ? (
              <>
                <li>
                  <Link href={`/users/${current_user.id}`}>
                    Welcome {current_user.email}
                  </Link>
                </li>
                <li className="divider" />
                <li>
                  <Link href="/share">
                    <span className="btn btn-primary">Share a movie</span>
                  </Link>
                </li>
                <li className="divider" />
                <li>
                  <Link href="#logout" onClick={onClick}>
                    <span className="btn btn-primary">Logout</span>
                  </Link>
                </li>
              </>
            ) : (
              <li>
                <Link href="/login">
                  <span className="btn btn-primary">Login / Register</span>
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;
