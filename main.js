/**
 * SurveyManager
 */
class SurveyManager {

	 /**
	 * Generates reference data for the survey, which would ordinarily 
	 * be stored elsewhere, and hold in instance variables
	 */
    constructor() {
    	// Define the questions
    	this._questions = [
    		{ "question_id": "Q-001", "label": "What is the legal name of your organisation?", "type": "text" },
    		{ "question_id": "Q-002", "label": "Are you VAT registered?", "type": "radio", "options": ["Yes", "No"] },
    		{ "question_id": "Q-003", "label": "What is your VAT number?", "type": "text" },
    		{ "question_id": "Q-004", "label": "How big is your organisation?", "type": "text" }
    	];

    	// Define the nodes - effectively an instance of a question, enabling questions to re-used
    	this._nodes = [
			{ "node_id": "N-001", "question_id": "Q-001" },
			{ "node_id": "N-002", "question_id": "Q-002" },
			{ "node_id": "N-003", "question_id": "Q-003" },
			{ "node_id": "N-004", "question_id": "Q-004" }
		];

		// Define the edges - connections between nodes that describe the branching behaviour
		this._edges = [
			{ "source_node_id": "N-001", "target_node_id": "N-002" },
			{ "source_node_id": "N-002", "target_node_id": "N-003", "constraint": "value == 1" },
			{ "source_node_id": "N-002", "target_node_id": "N-004", "constraint": "value == 2" },
			{ "source_node_id": "N-003", "target_node_id": "N-004" },
		];

		// Start on the first node in the graph
		this._currentNode = this._nodes[0];
		this.updateTemplateForNode(this._currentNode);
    }

    /**
	 * Finds a matching node object given an id
	 */
    findNodeForNodeId(nodeId) {
		var matchingNodes = this._nodes.filter(function(node) {
			return node.node_id == nodeId;
		});
		return matchingNodes[0];
    }

    /**
	 * Finds a matching question object given an id
	 */
    findQuestionForQuestionId(questionId) {
    	var matchingQuestions = this._questions.filter(function(question) {
			return question.question_id == questionId;
		});
		return matchingQuestions[0];
    }

    /**
	 * Submits an answer to the current question, determining which question to show next
	 * dependent on the question graph
	 */
    submit(textValue, radio1Value, radio2Value) {

    	// Validate the data - excluded here for brevity
    	// Store the data in the form variable - excluded here for brevity

    	// Determine the edges orginating from the current node
    	var currentNode = this._currentNode;
    	var matchingEdges = this._edges.filter(function(edge) {
  			return edge.source_node_id == currentNode.node_id;
		});

		// Determine whether any constrains are valid for the matching edges
		for (var matchingEdgeIndex in matchingEdges) {
			var matchingEdge = matchingEdges[matchingEdgeIndex];
  			if (matchingEdge.hasOwnProperty("constraint") == true) {
  				var value = (radio1Value == true ? 1 : 2);
  				var result = eval(matchingEdge.constraint);
  				if (result == true) {
  					this._currentNode = this.findNodeForNodeId(matchingEdge.target_node_id);
  					this.updateTemplateForNode(this._currentNode);
  					return;
  				}
			} else {
  				this._currentNode = this.findNodeForNodeId(matchingEdge.target_node_id);
  				this.updateTemplateForNode(this._currentNode);
  				return;
			}
		}

		// Show error given no valid edges were found from the current node
		this.updateTemplateWithError("No valid route was found from the current question to any subsequent questions.")
    }

    /**
	 * Updates template with the given node and question
	 *
	 * @param form
	 */
    updateTemplateForNode(node) {
    	console.log('Updating for node: ' + node.node_id);

    	// Lookup related question for given node
    	var matchingQuestion = this.findQuestionForQuestionId(node.question_id);

    	// Reset
    	document.getElementById("sp-text").value = null;
    	document.getElementById("sp-radio-1").checked = false;
    	document.getElementById("sp-radio-2").checked = false;

    	if (matchingQuestion.type == "text") {
    		var textGroup = document.getElementById("sp-text-group");
    		textGroup.style.display = "block";
    		var radioGroup = document.getElementById("sp-radio-group");
    		radioGroup.style.display = "none";
    		var textQuestionLabel = document.getElementById("sp-text-label");
	    	textQuestionLabel.innerHTML = matchingQuestion.label;
    	} else {
    		var textGroup = document.getElementById("sp-text-group");
    		textGroup.style.display = "none";
    		var radioGroup = document.getElementById("sp-radio-group");
    		radioGroup.style.display = "block";
	    	var radioQuestionLabel = document.getElementById("sp-radio-label");
	    	var radioAnswer1Label = document.getElementById("sp-radio1-label");
	    	var radioAnswer2Label = document.getElementById("sp-radio2-label");
	    	radioQuestionLabel.innerHTML = matchingQuestion.label;
	    	radioAnswer1Label.innerHTML = matchingQuestion.options[0];
	    	radioAnswer2Label.innerHTML = matchingQuestion.options[1];

    	}

    	// Reset and hide any error message
    	var errorSummary = document.getElementById("sp-error-summary");
    	errorSummary.style.display = "none";
    }

    /**
	 * Updates template with the given error
	 *
	 * @param errorDescription
	 */
    updateTemplateWithError(errorDescription) {
    	var errorSummary = document.getElementById("sp-error-summary");
    	var errorSummaryLabel = document.getElementById("sp-error-summary-label");
    	errorSummaryLabel.innerHTML = errorDescription;
    	errorSummary.style.display = "block";
    }
}

/**
 * Instanstiate SurveyManager instance on load event
 */
window.addEventListener('load', function() {
	var surveyManager = new SurveyManager();

	// Listen for CTA clicks
	var cta = document.getElementById("sp-cta");
	cta.addEventListener("click", function(event) {

		// Extract the form values 
    	var textValue = document.getElementById("sp-text").value;
    	var radio1Value = document.getElementById("sp-radio-1").checked;
    	var radio2Value = document.getElementById("sp-radio-2").checked;

		surveyManager.submit(textValue, radio1Value, radio2Value);
		return false;
	}, false);
});