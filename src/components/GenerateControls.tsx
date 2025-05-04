import React, {ChangeEvent, FC} from 'react';

export interface GenerateControlsProps {
    message: string;
    language: string
    namingConvention: string;
    commentStyle: string;
    codeComplexity: string;
    includeErrorHandling: boolean;
    onChange: (field: string, value: string | boolean) => void;
    onGenerateCode: () => void;
    onGenerateQuiz: () => void;
    loading: boolean;
}

const languages = ['JavaScript', 'Python', 'Java', 'C++'] as const;
const namingConventions = ['camelCase', 'snake_case', 'PascaleCase'] as const;
const commentStyles = ['minimal', 'detailed', 'javadoc'] as const;
const complexities = ['beginner', 'intermediate', 'advanced'] as const;

const GenerateControls: FC<GenerateControlsProps> = ({
    message,
    language,
    namingConvention,
    commentStyle,
    codeComplexity,
    includeErrorHandling,
    onChange,
    onGenerateCode,
    onGenerateQuiz,
    loading,
}) => (
    <div className="space-y-4 mb-6">
        <textarea
            id="messageInput"
            value={message}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange('message', e.target.value)}
            placeholder="Enter your assignment instructions here..."
            className="w-full rounded-lg p-3 bg-zinc-700 border border-zinc-600 text-white"
            rows={4}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="langugage" className="block text-sm font-medium mb-1 text-white">
                    Programming Language
                </label>
                <select
                    id="language"
                    value={language}
                    onChange={(e) => onChange('language', e.target.value)}
                    className="w-full p-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white rounded-lg text-white"
                >
                    {languages.map((lang) => (
                        <option key={lang} value={lang}> {lang} </option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="namingConvention" className="block text-sm font-medium mb-1 text-white">
                    Naming Convention
                </label>
                <select
                    id="namingConvention"
                    value={namingConvention}
                    onChange={(e) => onChange('namingConvention', e.target.value)}
                    className="w-full p-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white"
                >
                    {namingConventions.map((nc) => (
                        <option key={nc} value={nc}>
                            {nc}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="commentStyle" className="block text-sm font-medium mb-1 text-white">
                    Code Complexity
                </label>
                <select
                    id="commentStyle"
                    value={commentStyle}
                    onChange={(e) => onChange('commentStyle', e.target.value)}
                    className="w-full p-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white"
                >
                    {commentStyles.map((cs) => (
                        <option key={cs} value={cs}>
                            {cs}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="codeComplexity" className="block text-sm font-medium mb-1 text-white">
                    Code Complexity
                </label>
                <select
                    id="codeComplexity"
                    value={codeComplexity}
                    onChange={(e) => onChange('codeComplexity', e.target.value)}
                    className="w-full p-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white"
                >
                    {complexities.map((cx) => (
                        <option key={cx} value={cx}>
                            {cx}
                        </option>
                    ))}
                </select>
            </div>


            <div className="col-span-1 md:col-span-2 flex items-center">
                <input
                    id="errorHandling"
                    type="checkbox"
                    checked={includeErrorHandling}
                    onChange={(e) => onChange('includeErrorHandling', e.target.checked)}
                    className="form-checkbox text-blue-600 h-4 w-4 rounded focus:ring-blue-500"
                />
                <label htmlFor="errorHandling" className="ml-2 text-white">
                    Include Error Handling
                </label>
            </div>
        </div>

        <div className="flex space-x-4">
            <button
                onClick={onGenerateCode}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                disabled={loading}
            >
                🚀 Generate Code
            </button>
            
            <button
                onClick={onGenerateQuiz}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                disabled={loading}
            >
                🧠 Generate Quiz
            </button>
        </div>
    </div>
);

export default GenerateControls;



