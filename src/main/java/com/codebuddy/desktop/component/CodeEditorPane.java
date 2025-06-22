package com.codebuddy.desktop.component;

import org.fxmisc.richtext.CodeArea;
import org.fxmisc.richtext.LineNumberFactory;
import org.fxmisc.richtext.model.StyleSpans;
import org.fxmisc.richtext.model.StyleSpansBuilder;
import javafx.scene.layout.StackPane;

import java.util.Collection;
import java.util.Collections;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Code editor component with syntax highlighting
 */
public class CodeEditorPane extends StackPane {

    private final CodeArea codeArea;
    
    // Java syntax highlighting patterns
    private static final String[] KEYWORDS = new String[] {
        "abstract", "assert", "boolean", "break", "byte", "case", "catch", "char", 
        "class", "const", "continue", "default", "do", "double", "else", "enum", 
        "extends", "final", "finally", "float", "for", "goto", "if", "implements", 
        "import", "instanceof", "int", "interface", "long", "native", "new", 
        "package", "private", "protected", "public", "return", "short", "static", 
        "strictfp", "super", "switch", "synchronized", "this", "throw", "throws", 
        "transient", "try", "void", "volatile", "while"
    };

    private static final String KEYWORD_PATTERN = "\\b(" + String.join("|", KEYWORDS) + ")\\b";
    private static final String PAREN_PATTERN = "\\(|\\)";
    private static final String BRACE_PATTERN = "\\{|\\}";
    private static final String BRACKET_PATTERN = "\\[|\\]";
    private static final String SEMICOLON_PATTERN = "\\;";
    private static final String STRING_PATTERN = "\"([^\"\\\\]|\\\\.)*\"";
    private static final String COMMENT_PATTERN = "//[^\n]*" + "|" + "/\\*(.|\\R)*?\\*/";

    private static final Pattern PATTERN = Pattern.compile(
        "(?<KEYWORD>" + KEYWORD_PATTERN + ")"
        + "|(?<PAREN>" + PAREN_PATTERN + ")"
        + "|(?<BRACE>" + BRACE_PATTERN + ")"
        + "|(?<BRACKET>" + BRACKET_PATTERN + ")"
        + "|(?<SEMICOLON>" + SEMICOLON_PATTERN + ")"
        + "|(?<STRING>" + STRING_PATTERN + ")"
        + "|(?<COMMENT>" + COMMENT_PATTERN + ")"
    );

    public CodeEditorPane() {
        codeArea = new CodeArea();
        
        // Add line numbers
        codeArea.setParagraphGraphicFactory(LineNumberFactory.get(codeArea));
        
        // Enable syntax highlighting
        codeArea.richChanges()
                .filter(ch -> !ch.getInserted().equals(ch.getRemoved()))
                .subscribe(change -> {
                    codeArea.setStyleSpans(0, computeHighlighting(codeArea.getText()));
                });

        // Set initial content
        codeArea.replaceText(0, 0, getSampleJavaCode());
        
        // Apply initial highlighting
        codeArea.setStyleSpans(0, computeHighlighting(codeArea.getText()));
        
        getChildren().add(codeArea);
        
        // Load CSS for syntax highlighting
        getStylesheets().add(getClass().getResource("/css/code-editor.css").toExternalForm());
    }

    private StyleSpans<Collection<String>> computeHighlighting(String text) {
        Matcher matcher = PATTERN.matcher(text);
        int lastKwEnd = 0;
        StyleSpansBuilder<Collection<String>> spansBuilder = new StyleSpansBuilder<>();
        
        while (matcher.find()) {
            String styleClass =
                matcher.group("KEYWORD") != null ? "keyword" :
                matcher.group("PAREN") != null ? "paren" :
                matcher.group("BRACE") != null ? "brace" :
                matcher.group("BRACKET") != null ? "bracket" :
                matcher.group("SEMICOLON") != null ? "semicolon" :
                matcher.group("STRING") != null ? "string" :
                matcher.group("COMMENT") != null ? "comment" :
                null;
            
            spansBuilder.add(Collections.emptyList(), matcher.start() - lastKwEnd);
            spansBuilder.add(Collections.singleton(styleClass), matcher.end() - matcher.start());
            lastKwEnd = matcher.end();
        }
        spansBuilder.add(Collections.emptyList(), text.length() - lastKwEnd);
        return spansBuilder.create();
    }

    public String getText() {
        return codeArea.getText();
    }

    public void setText(String text) {
        codeArea.replaceText(text);
    }

    public String getSelectedText() {
        return codeArea.getSelectedText();
    }

    public void insertText(int position, String text) {
        codeArea.insertText(position, text);
    }

    public void replaceSelection(String replacement) {
        codeArea.replaceSelection(replacement);
    }

    private String getSampleJavaCode() {
        return """
            package com.example;
            
            import java.util.List;
            import java.util.ArrayList;
            
            /**
             * Sample Java class for CodeBuddy.ai
             */
            public class HelloWorld {
                
                private String message;
                
                public HelloWorld(String message) {
                    this.message = message;
                }
                
                public void printMessage() {
                    System.out.println("Hello, " + message + "!");
                }
                
                public static void main(String[] args) {
                    HelloWorld hello = new HelloWorld("CodeBuddy.ai");
                    hello.printMessage();
                    
                    // Create a list of numbers
                    List<Integer> numbers = new ArrayList<>();
                    for (int i = 1; i <= 10; i++) {
                        numbers.add(i);
                    }
                    
                    // Print even numbers
                    numbers.stream()
                           .filter(n -> n % 2 == 0)
                           .forEach(System.out::println);
                }
            }
            """;
    }
}