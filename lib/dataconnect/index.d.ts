import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface AddGameStatData {
  gameStat_insert: GameStat_Key;
}

export interface AddGameStatVariables {
  userId: string;
  gameName: string;
  date: DateString;
  mode: string;
  won: boolean;
  mistakes: number;
  attempts: number;
  timeToCompleteSeconds?: number | null;
  isPlayTest: boolean;
}

export interface GameStat_Key {
  id: UUIDString;
  __typename?: 'GameStat_Key';
}

export interface GetAllGameStatsData {
  gameStats: ({
    id: UUIDString;
    gameName: string;
    date: DateString;
    mode: string;
    won: boolean;
    mistakes: number;
    attempts: number;
    isPlayTest: boolean;
  } & GameStat_Key)[];
}

export interface GetAllUsersData {
  users: ({
    id: string;
    email?: string | null;
    displayName?: string | null;
    role: string;
  } & User_Key)[];
}

export interface GetUserStatsData {
  gameStats: ({
    id: UUIDString;
    gameName: string;
    date: DateString;
    mode: string;
    won: boolean;
    mistakes: number;
    attempts: number;
    timeToCompleteSeconds?: number | null;
  } & GameStat_Key)[];
}

export interface GetUserStatsVariables {
  userId: string;
}

export interface UpdateUserRoleData {
  user_update?: User_Key | null;
}

export interface UpdateUserRoleVariables {
  targetUid: string;
  newRole: string;
}

export interface UpsertUserData {
  user_upsert: User_Key;
}

export interface UpsertUserVariables {
  id: string;
  email?: string | null;
  displayName?: string | null;
  role: string;
}

export interface User_Key {
  id: string;
  __typename?: 'User_Key';
}

interface UpsertUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertUserVariables): MutationRef<UpsertUserData, UpsertUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpsertUserVariables): MutationRef<UpsertUserData, UpsertUserVariables>;
  operationName: string;
}
export const upsertUserRef: UpsertUserRef;

export function upsertUser(vars: UpsertUserVariables): MutationPromise<UpsertUserData, UpsertUserVariables>;
export function upsertUser(dc: DataConnect, vars: UpsertUserVariables): MutationPromise<UpsertUserData, UpsertUserVariables>;

interface AddGameStatRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddGameStatVariables): MutationRef<AddGameStatData, AddGameStatVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: AddGameStatVariables): MutationRef<AddGameStatData, AddGameStatVariables>;
  operationName: string;
}
export const addGameStatRef: AddGameStatRef;

export function addGameStat(vars: AddGameStatVariables): MutationPromise<AddGameStatData, AddGameStatVariables>;
export function addGameStat(dc: DataConnect, vars: AddGameStatVariables): MutationPromise<AddGameStatData, AddGameStatVariables>;

interface UpdateUserRoleRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateUserRoleVariables): MutationRef<UpdateUserRoleData, UpdateUserRoleVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateUserRoleVariables): MutationRef<UpdateUserRoleData, UpdateUserRoleVariables>;
  operationName: string;
}
export const updateUserRoleRef: UpdateUserRoleRef;

export function updateUserRole(vars: UpdateUserRoleVariables): MutationPromise<UpdateUserRoleData, UpdateUserRoleVariables>;
export function updateUserRole(dc: DataConnect, vars: UpdateUserRoleVariables): MutationPromise<UpdateUserRoleData, UpdateUserRoleVariables>;

interface GetUserStatsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserStatsVariables): QueryRef<GetUserStatsData, GetUserStatsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetUserStatsVariables): QueryRef<GetUserStatsData, GetUserStatsVariables>;
  operationName: string;
}
export const getUserStatsRef: GetUserStatsRef;

export function getUserStats(vars: GetUserStatsVariables): QueryPromise<GetUserStatsData, GetUserStatsVariables>;
export function getUserStats(dc: DataConnect, vars: GetUserStatsVariables): QueryPromise<GetUserStatsData, GetUserStatsVariables>;

interface GetAllUsersRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetAllUsersData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetAllUsersData, undefined>;
  operationName: string;
}
export const getAllUsersRef: GetAllUsersRef;

export function getAllUsers(): QueryPromise<GetAllUsersData, undefined>;
export function getAllUsers(dc: DataConnect): QueryPromise<GetAllUsersData, undefined>;

interface GetAllGameStatsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetAllGameStatsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetAllGameStatsData, undefined>;
  operationName: string;
}
export const getAllGameStatsRef: GetAllGameStatsRef;

export function getAllGameStats(): QueryPromise<GetAllGameStatsData, undefined>;
export function getAllGameStats(dc: DataConnect): QueryPromise<GetAllGameStatsData, undefined>;

