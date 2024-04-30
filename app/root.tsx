import { json, redirect } from "@remix-run/node";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  Links,
  Meta,
  Scripts,
  Outlet,
  ScrollRestoration,
  useLoaderData,
  NavLink,
  useNavigation,
  useSubmit,
} from "@remix-run/react";



import appStylesHref from "./app.css?url";
import { createEmptyContact, getContacts } from "./data";
import { useEffect } from "react";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: appStylesHref },
];

// loader関数は、getメソッドに対応し、データの取得を行うための関数です。（固有名詞）
// loader関数は、サーバーサイドで実行される関数です。（固有名詞）
export const loader = async ({
  request,
}: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const contacts = await getContacts(q);
  return json({ contacts, q });
};

// action関数は、postメソッドに対応し、データの変更を行うための関数です。（固有名詞）
// action関数は、サーバーサイドで実行される関数です。（固有名詞）
export const action = async () => {
  const contact = await createEmptyContact();
  return redirect(`/contacts/${contact.id}/edit`);
};

export default function App() {
  // typeofを使い、loader関数の戻り値の型を取得します。
  const { contacts, q } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const submit = useSubmit();
  // ナビゲーション一覧が検索中かどうか判断
  const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).has(
      "q"
    );

  // 戻るボタンを押した際に検索フォームと値を同期させる
  // 例えば、戻るボタンで検索値がクリアされた場合、検索フォームの値もクリアされる
  useEffect(() => {
    const searchField = document.getElementById("q");
    if (searchField instanceof HTMLInputElement) {
      searchField.value = q || "";
    }
  }, [q]);


  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div id="sidebar">
          <h1>Remix Contacts!!
          </h1>
          <div>
            {/* getメソッドが使用される onChangeメソッドで入力のたびにフィルターがかかる*/}
            {/* 初回検索以外は検索履歴が置き換えられることにより、 検索を削除するために 7 回戻るクリックをする代わりに、ユーザーは 1 回戻るをクリックするだけで済みます*/}
            <Form id="search-form" role="search" onChange={(event) => {
              const isFirstSearch = q === null;
              submit(event.currentTarget, {
                replace: !isFirstSearch,
              });
            }}
            >
              <input
                id="q"
                className={searching ? "loading" : ""}
                defaultValue={q || ""}
                aria-label="Search contacts"
                placeholder="Search"
                type="search"
                name="q"
              />
              <div id="search-spinner" aria-hidden hidden={!searching}
              />
            </Form>
            <Form method="post">
              <button type="submit">検索</button>
            </Form>
          </div>
          <nav>
            {contacts.length ? (
              <ul>
                {contacts.map((contact) => (
                  <li key={contact.id}>
                    {/* NavLinkによってアクティブなリンクの判定ができる */}
                    <NavLink
                      className={({ isActive, isPending }) =>
                        isActive
                          ? "active"
                          : isPending
                            ? "pending"
                            : ""
                      }
                      to={`contacts/${contact.id}`}
                    >
                      {contact.first || contact.last ? (
                        <>
                          {contact.first} {contact.last}
                        </>
                      ) : (
                        <i>No Name</i>
                      )}{" "}
                      {contact.favorite ? (
                        <span>★</span>
                      ) : null}
                    </NavLink>
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                <i>No contacts</i>
              </p>
            )}
          </nav>
        </div>
        <div className={
          navigation.state === "loading" && !searching
            ? "loading"
            : ""
        } id="detail">
          {/* Outletは親ルートのテンプレート内で子ルートのコンポーネントをレンダリングする役割を果たします */}
          {/* これがないと子コンポーネントで実装したものが表示されません */}
          <Outlet />
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
