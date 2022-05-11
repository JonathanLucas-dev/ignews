import { query } from "faunadb"
import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"

import {fauna} from "../../../services/fauna"

export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, credentials }) {
      const {email} = user;
      
      try {
        await fauna.query(
          query.If(
            query.Not(
              query.Exists(
                query.Match(
                  query.Index("user_email"),
                  query.Casefold(user.email)
                )
              )
            ),
            query.Create(
              query.Collection("users"),
              {data: {email}}
            ),
            query.Get(
              query.Match(
                query.Index("user_email"),
                query.Casefold(user.email)
              )
            )
          )
        )
        return true
      } catch (error) {
        return false
        
      }
   
    },
  }
})