const PgAggregatesPlugin = require("@graphile/pg-aggregates").default;
const { postgraphile, makePluginHook } = require("postgraphile");
const { default: PgPubsub } = require("@graphile/pg-pubsub");
const { PgMutationUpsertPlugin } = require("postgraphile-upsert-plugin");
const ConnectionFilterPlugin = require("postgraphile-plugin-connection-filter");

const pluginHook = makePluginHook([PgPubsub]);

module.exports = postgraphile(
    {
        database: 'mageus',
        user: 'postgres',
        password: '8888',
        host: 'localhost',
        port: '5433',
    },
    'public',
    {
        pluginHook,
        subscriptions: true,
        simpleSubscriptions: true,
        dynamicJson: true,
        watchPg: true,
        graphiql: true,
        showErrorStack: "json",
        enhanceGraphiql: true,
        extendedErrors: ['hint', 'detail', 'errcode'],
        appendPlugins: [
            PgAggregatesPlugin,
            PgMutationUpsertPlugin,
            ConnectionFilterPlugin,
            require('@graphile-contrib/pg-simplify-inflector')
        ],
        enableQueryBatching: true,
        allowExplain: true,

    }
    
)


// npx postgraphile -c postgres://postgres:8888@localhost/demistars --watch --enhance-graphiql --dynamic-json




