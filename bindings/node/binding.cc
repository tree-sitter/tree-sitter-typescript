#include <napi.h>

typedef struct TSLanguage TSLanguage;

extern "C" TSLanguage *tree_sitter_typescript();
extern "C" TSLanguage * tree_sitter_tsx();

// "tree-sitter", "language" hashed with BLAKE2
const napi_type_tag LANGUAGE_TYPE_TAG = {
  0x8AF2E5212AD58ABF, 0xD5006CAD83ABBA16
};

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    auto ts = Napi::Object::New(env);
    ts["name"] = Napi::String::New(env, "typescript");
    auto language_ts = Napi::External<TSLanguage>::New(env, tree_sitter_typescript());
    language.TypeTag(&LANGUAGE_TYPE_TAG);
    ts["language"] = language_ts;

    auto tsx = Napi::Object::New(env);
    ts["name"] = Napi::String::New(env, "tsx");
    auto language_tsx = Napi::External<TSLanguage>::New(env, tree_sitter_tsx());
    language.TypeTag(&LANGUAGE_TYPE_TAG);
    ts["language"] = language_tsx;

    exports["typescript"] = ts;
    exports["tsx"] = tsx;

    return exports;
}

NODE_API_MODULE(tree_sitter_typescript_binding, Init)
