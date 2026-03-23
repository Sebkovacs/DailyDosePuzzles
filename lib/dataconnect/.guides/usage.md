# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { upsertUser, addGameStat, updateUserRole, getUserStats, getAllUsers, getAllGameStats } from '@dataconnect/default';


// Operation UpsertUser:  For variables, look at type UpsertUserVars in ../index.d.ts
const { data } = await UpsertUser(dataConnect, upsertUserVars);

// Operation AddGameStat:  For variables, look at type AddGameStatVars in ../index.d.ts
const { data } = await AddGameStat(dataConnect, addGameStatVars);

// Operation UpdateUserRole:  For variables, look at type UpdateUserRoleVars in ../index.d.ts
const { data } = await UpdateUserRole(dataConnect, updateUserRoleVars);

// Operation GetUserStats:  For variables, look at type GetUserStatsVars in ../index.d.ts
const { data } = await GetUserStats(dataConnect, getUserStatsVars);

// Operation GetAllUsers: 
const { data } = await GetAllUsers(dataConnect);

// Operation GetAllGameStats: 
const { data } = await GetAllGameStats(dataConnect);


```