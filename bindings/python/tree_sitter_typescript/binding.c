#include <Python.h>

typedef struct TSLanguage TSLanguage;

TSLanguage *tree_sitter_typescript(void);
TSLanguage *tree_sitter_tsx(void);

static PyObject* _binding_language_typescript(PyObject *self, PyObject *args) {
    return PyLong_FromVoidPtr(tree_sitter_typescript());
}

static PyObject* _binding_language_tsx(PyObject *self, PyObject *args) {
    return PyLong_FromVoidPtr(tree_sitter_tsx());
}

static PyMethodDef methods[] = {
    {"language_typescript", _binding_language_typescript, METH_NOARGS,
     "Get the tree-sitter language for TypeScript."},
    {"language_tsx", _binding_language_tsx, METH_NOARGS,
     "Get the tree-sitter language for TSX."},
    {NULL, NULL, 0, NULL}
};

static struct PyModuleDef module = {
    .m_base = PyModuleDef_HEAD_INIT,
    .m_name = "_binding",
    .m_doc = NULL,
    .m_size = -1,
    .m_methods = methods
};

PyMODINIT_FUNC PyInit__binding(void) {
    return PyModule_Create(&module);
}
