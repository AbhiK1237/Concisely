import { generateSummary } from "../services/openaiService";


async function test() {
    try {
        const content = "LLMs are a key artificial intelligence (AI) technology powering intelligent chatbots and other natural language processing (NLP) applications. The goal is to create bots that can answer user questions in various contexts by cross-referencing authoritative knowledge sources. Unfortunately, the nature of LLM technology introduces unpredictability in LLM responses. Additionally, LLM training data is static and introduces a cut-off date on the knowledge it has Known challenges of LLMs include Presenting false information when it does not have the answer.Presenting out-of-date or generic information when the user expects a specific, current response.Creating a response from non-authoritative sources.Creating inaccurate responses due to terminology confusion, wherein different training sources use the same terminology to talk about different things.You can think of the Large Language Model as an over-enthusiastic new employee who refuses to stay informed with current events but will always answer every question with absolute confidence. Unfortunately, such an attitude can negatively impact user trust and is not something you want your chatbots to emulate!RAG is one approach to solving some of these challenges. It redirects the LLM to retrieve relevant information from authoritative, pre-determined knowledge sources. Organizations have greater control over the generated text output, and users gain insights into how the LLM generates the response"

        const type = "article"
        const length = "medium"
        const summary = await generateSummary(content, type, length);
        console.log("Summary:", summary);
    }

    catch (error) {
        console.error('Test failed:', error);
    }
}

test();