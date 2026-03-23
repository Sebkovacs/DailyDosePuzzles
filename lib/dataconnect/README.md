# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `default`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetUserStats*](#getuserstats)
  - [*GetAllUsers*](#getallusers)
  - [*GetAllGameStats*](#getallgamestats)
- [**Mutations**](#mutations)
  - [*UpsertUser*](#upsertuser)
  - [*AddGameStat*](#addgamestat)
  - [*UpdateUserRole*](#updateuserrole)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `default`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/default` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/default';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/default';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `default` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## GetUserStats
You can execute the `GetUserStats` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getUserStats(vars: GetUserStatsVariables): QueryPromise<GetUserStatsData, GetUserStatsVariables>;

interface GetUserStatsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserStatsVariables): QueryRef<GetUserStatsData, GetUserStatsVariables>;
}
export const getUserStatsRef: GetUserStatsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getUserStats(dc: DataConnect, vars: GetUserStatsVariables): QueryPromise<GetUserStatsData, GetUserStatsVariables>;

interface GetUserStatsRef {
  ...
  (dc: DataConnect, vars: GetUserStatsVariables): QueryRef<GetUserStatsData, GetUserStatsVariables>;
}
export const getUserStatsRef: GetUserStatsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getUserStatsRef:
```typescript
const name = getUserStatsRef.operationName;
console.log(name);
```

### Variables
The `GetUserStats` query requires an argument of type `GetUserStatsVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetUserStatsVariables {
  userId: string;
}
```
### Return Type
Recall that executing the `GetUserStats` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetUserStatsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetUserStats`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getUserStats, GetUserStatsVariables } from '@dataconnect/default';

// The `GetUserStats` query requires an argument of type `GetUserStatsVariables`:
const getUserStatsVars: GetUserStatsVariables = {
  userId: ..., 
};

// Call the `getUserStats()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getUserStats(getUserStatsVars);
// Variables can be defined inline as well.
const { data } = await getUserStats({ userId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getUserStats(dataConnect, getUserStatsVars);

console.log(data.gameStats);

// Or, you can use the `Promise` API.
getUserStats(getUserStatsVars).then((response) => {
  const data = response.data;
  console.log(data.gameStats);
});
```

### Using `GetUserStats`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getUserStatsRef, GetUserStatsVariables } from '@dataconnect/default';

// The `GetUserStats` query requires an argument of type `GetUserStatsVariables`:
const getUserStatsVars: GetUserStatsVariables = {
  userId: ..., 
};

// Call the `getUserStatsRef()` function to get a reference to the query.
const ref = getUserStatsRef(getUserStatsVars);
// Variables can be defined inline as well.
const ref = getUserStatsRef({ userId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getUserStatsRef(dataConnect, getUserStatsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.gameStats);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.gameStats);
});
```

## GetAllUsers
You can execute the `GetAllUsers` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getAllUsers(): QueryPromise<GetAllUsersData, undefined>;

interface GetAllUsersRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetAllUsersData, undefined>;
}
export const getAllUsersRef: GetAllUsersRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getAllUsers(dc: DataConnect): QueryPromise<GetAllUsersData, undefined>;

interface GetAllUsersRef {
  ...
  (dc: DataConnect): QueryRef<GetAllUsersData, undefined>;
}
export const getAllUsersRef: GetAllUsersRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getAllUsersRef:
```typescript
const name = getAllUsersRef.operationName;
console.log(name);
```

### Variables
The `GetAllUsers` query has no variables.
### Return Type
Recall that executing the `GetAllUsers` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetAllUsersData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetAllUsersData {
  users: ({
    id: string;
    email?: string | null;
    displayName?: string | null;
    role: string;
  } & User_Key)[];
}
```
### Using `GetAllUsers`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getAllUsers } from '@dataconnect/default';


// Call the `getAllUsers()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getAllUsers();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getAllUsers(dataConnect);

console.log(data.users);

// Or, you can use the `Promise` API.
getAllUsers().then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

### Using `GetAllUsers`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getAllUsersRef } from '@dataconnect/default';


// Call the `getAllUsersRef()` function to get a reference to the query.
const ref = getAllUsersRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getAllUsersRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.users);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

## GetAllGameStats
You can execute the `GetAllGameStats` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getAllGameStats(): QueryPromise<GetAllGameStatsData, undefined>;

interface GetAllGameStatsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetAllGameStatsData, undefined>;
}
export const getAllGameStatsRef: GetAllGameStatsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getAllGameStats(dc: DataConnect): QueryPromise<GetAllGameStatsData, undefined>;

interface GetAllGameStatsRef {
  ...
  (dc: DataConnect): QueryRef<GetAllGameStatsData, undefined>;
}
export const getAllGameStatsRef: GetAllGameStatsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getAllGameStatsRef:
```typescript
const name = getAllGameStatsRef.operationName;
console.log(name);
```

### Variables
The `GetAllGameStats` query has no variables.
### Return Type
Recall that executing the `GetAllGameStats` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetAllGameStatsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetAllGameStats`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getAllGameStats } from '@dataconnect/default';


// Call the `getAllGameStats()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getAllGameStats();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getAllGameStats(dataConnect);

console.log(data.gameStats);

// Or, you can use the `Promise` API.
getAllGameStats().then((response) => {
  const data = response.data;
  console.log(data.gameStats);
});
```

### Using `GetAllGameStats`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getAllGameStatsRef } from '@dataconnect/default';


// Call the `getAllGameStatsRef()` function to get a reference to the query.
const ref = getAllGameStatsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getAllGameStatsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.gameStats);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.gameStats);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `default` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## UpsertUser
You can execute the `UpsertUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
upsertUser(vars: UpsertUserVariables): MutationPromise<UpsertUserData, UpsertUserVariables>;

interface UpsertUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertUserVariables): MutationRef<UpsertUserData, UpsertUserVariables>;
}
export const upsertUserRef: UpsertUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
upsertUser(dc: DataConnect, vars: UpsertUserVariables): MutationPromise<UpsertUserData, UpsertUserVariables>;

interface UpsertUserRef {
  ...
  (dc: DataConnect, vars: UpsertUserVariables): MutationRef<UpsertUserData, UpsertUserVariables>;
}
export const upsertUserRef: UpsertUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the upsertUserRef:
```typescript
const name = upsertUserRef.operationName;
console.log(name);
```

### Variables
The `UpsertUser` mutation requires an argument of type `UpsertUserVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpsertUserVariables {
  id: string;
  email?: string | null;
  displayName?: string | null;
  role: string;
}
```
### Return Type
Recall that executing the `UpsertUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpsertUserData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpsertUserData {
  user_upsert: User_Key;
}
```
### Using `UpsertUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, upsertUser, UpsertUserVariables } from '@dataconnect/default';

// The `UpsertUser` mutation requires an argument of type `UpsertUserVariables`:
const upsertUserVars: UpsertUserVariables = {
  id: ..., 
  email: ..., // optional
  displayName: ..., // optional
  role: ..., 
};

// Call the `upsertUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await upsertUser(upsertUserVars);
// Variables can be defined inline as well.
const { data } = await upsertUser({ id: ..., email: ..., displayName: ..., role: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await upsertUser(dataConnect, upsertUserVars);

console.log(data.user_upsert);

// Or, you can use the `Promise` API.
upsertUser(upsertUserVars).then((response) => {
  const data = response.data;
  console.log(data.user_upsert);
});
```

### Using `UpsertUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, upsertUserRef, UpsertUserVariables } from '@dataconnect/default';

// The `UpsertUser` mutation requires an argument of type `UpsertUserVariables`:
const upsertUserVars: UpsertUserVariables = {
  id: ..., 
  email: ..., // optional
  displayName: ..., // optional
  role: ..., 
};

// Call the `upsertUserRef()` function to get a reference to the mutation.
const ref = upsertUserRef(upsertUserVars);
// Variables can be defined inline as well.
const ref = upsertUserRef({ id: ..., email: ..., displayName: ..., role: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = upsertUserRef(dataConnect, upsertUserVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_upsert);
});
```

## AddGameStat
You can execute the `AddGameStat` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
addGameStat(vars: AddGameStatVariables): MutationPromise<AddGameStatData, AddGameStatVariables>;

interface AddGameStatRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddGameStatVariables): MutationRef<AddGameStatData, AddGameStatVariables>;
}
export const addGameStatRef: AddGameStatRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
addGameStat(dc: DataConnect, vars: AddGameStatVariables): MutationPromise<AddGameStatData, AddGameStatVariables>;

interface AddGameStatRef {
  ...
  (dc: DataConnect, vars: AddGameStatVariables): MutationRef<AddGameStatData, AddGameStatVariables>;
}
export const addGameStatRef: AddGameStatRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the addGameStatRef:
```typescript
const name = addGameStatRef.operationName;
console.log(name);
```

### Variables
The `AddGameStat` mutation requires an argument of type `AddGameStatVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `AddGameStat` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `AddGameStatData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface AddGameStatData {
  gameStat_insert: GameStat_Key;
}
```
### Using `AddGameStat`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, addGameStat, AddGameStatVariables } from '@dataconnect/default';

// The `AddGameStat` mutation requires an argument of type `AddGameStatVariables`:
const addGameStatVars: AddGameStatVariables = {
  userId: ..., 
  gameName: ..., 
  date: ..., 
  mode: ..., 
  won: ..., 
  mistakes: ..., 
  attempts: ..., 
  timeToCompleteSeconds: ..., // optional
  isPlayTest: ..., 
};

// Call the `addGameStat()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await addGameStat(addGameStatVars);
// Variables can be defined inline as well.
const { data } = await addGameStat({ userId: ..., gameName: ..., date: ..., mode: ..., won: ..., mistakes: ..., attempts: ..., timeToCompleteSeconds: ..., isPlayTest: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await addGameStat(dataConnect, addGameStatVars);

console.log(data.gameStat_insert);

// Or, you can use the `Promise` API.
addGameStat(addGameStatVars).then((response) => {
  const data = response.data;
  console.log(data.gameStat_insert);
});
```

### Using `AddGameStat`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, addGameStatRef, AddGameStatVariables } from '@dataconnect/default';

// The `AddGameStat` mutation requires an argument of type `AddGameStatVariables`:
const addGameStatVars: AddGameStatVariables = {
  userId: ..., 
  gameName: ..., 
  date: ..., 
  mode: ..., 
  won: ..., 
  mistakes: ..., 
  attempts: ..., 
  timeToCompleteSeconds: ..., // optional
  isPlayTest: ..., 
};

// Call the `addGameStatRef()` function to get a reference to the mutation.
const ref = addGameStatRef(addGameStatVars);
// Variables can be defined inline as well.
const ref = addGameStatRef({ userId: ..., gameName: ..., date: ..., mode: ..., won: ..., mistakes: ..., attempts: ..., timeToCompleteSeconds: ..., isPlayTest: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = addGameStatRef(dataConnect, addGameStatVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.gameStat_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.gameStat_insert);
});
```

## UpdateUserRole
You can execute the `UpdateUserRole` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
updateUserRole(vars: UpdateUserRoleVariables): MutationPromise<UpdateUserRoleData, UpdateUserRoleVariables>;

interface UpdateUserRoleRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateUserRoleVariables): MutationRef<UpdateUserRoleData, UpdateUserRoleVariables>;
}
export const updateUserRoleRef: UpdateUserRoleRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateUserRole(dc: DataConnect, vars: UpdateUserRoleVariables): MutationPromise<UpdateUserRoleData, UpdateUserRoleVariables>;

interface UpdateUserRoleRef {
  ...
  (dc: DataConnect, vars: UpdateUserRoleVariables): MutationRef<UpdateUserRoleData, UpdateUserRoleVariables>;
}
export const updateUserRoleRef: UpdateUserRoleRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateUserRoleRef:
```typescript
const name = updateUserRoleRef.operationName;
console.log(name);
```

### Variables
The `UpdateUserRole` mutation requires an argument of type `UpdateUserRoleVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateUserRoleVariables {
  targetUid: string;
  newRole: string;
}
```
### Return Type
Recall that executing the `UpdateUserRole` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateUserRoleData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateUserRoleData {
  user_update?: User_Key | null;
}
```
### Using `UpdateUserRole`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateUserRole, UpdateUserRoleVariables } from '@dataconnect/default';

// The `UpdateUserRole` mutation requires an argument of type `UpdateUserRoleVariables`:
const updateUserRoleVars: UpdateUserRoleVariables = {
  targetUid: ..., 
  newRole: ..., 
};

// Call the `updateUserRole()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateUserRole(updateUserRoleVars);
// Variables can be defined inline as well.
const { data } = await updateUserRole({ targetUid: ..., newRole: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateUserRole(dataConnect, updateUserRoleVars);

console.log(data.user_update);

// Or, you can use the `Promise` API.
updateUserRole(updateUserRoleVars).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

### Using `UpdateUserRole`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateUserRoleRef, UpdateUserRoleVariables } from '@dataconnect/default';

// The `UpdateUserRole` mutation requires an argument of type `UpdateUserRoleVariables`:
const updateUserRoleVars: UpdateUserRoleVariables = {
  targetUid: ..., 
  newRole: ..., 
};

// Call the `updateUserRoleRef()` function to get a reference to the mutation.
const ref = updateUserRoleRef(updateUserRoleVars);
// Variables can be defined inline as well.
const ref = updateUserRoleRef({ targetUid: ..., newRole: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateUserRoleRef(dataConnect, updateUserRoleVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

