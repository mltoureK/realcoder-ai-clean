import React, {useEffect, useRef, FC } from 'react';
import { EditorFromTextArea,  fromTextArea } from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/python/python';
import 'codemirror/mode/clike/clike';

export interface CodeEditorProps {
    mode?: string;
    value: string;
    onChange: (value: string) => void;
}

const CodeEditor: FC<CodeEditorProps> = ({ mode = 'javascript', value, onChange }) => {
    const editorRef = useRef<EditorFromTextArea>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (!textareaRef.current) return;
        editorRef.current = fromTextArea(textareaRef.current, {
            mode,
            theme: 'material',
            lineNumbers: true,
            tabSize: 2,
            viewportMargin: Infinity
        });
        editorRef.current.setValue(value);
        editorRef.current.on('change', () => {
            onChange(editorRef.current!.getvalue());
        });
    },  [mode]);

    useEffect(() => {
        if (!textareaRef.current && value !== editorRef.current.getvalue()){
            editorRef.current.setValue(value);
        }
    }
    , [value]);

    return <textarea ref={textareaRef} rows={10} className="w-full mb-4" />;
};

export default CodeEditor;