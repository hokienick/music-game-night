describe("Create Game Form Automation Test", () => {
    beforeEach(() => {
      // Visit the Create Game page before each test
      cy.visit("/admin/create-game.html");
    });
  
    it("should fill out the Create Game form and submit successfully", () => {
      // Fill in the Date of Event
      cy.get("#event-date").type("2024-12-31");
  
      // Select a location
      cy.get("#location-dropdown").select("Original 40"); // Adjust the value to match a location from your database
  
      // Enter the Music File URL
      cy.get("#music-url").type("https://drive.google.com/file/d/EXAMPLE_ID/view?usp=sharing");
  
      // Select a Host
      cy.get("#host-dropdown").select("hokienick@gmail.com"); // Adjust the value to match a host from your database
  
      // Fill Round 1 questions
      for (let question = 1; question <= 5; question++) {
        cy.get(`#round1-q${question}`).type(`First Word ${question}`);
      }
  
      // Fill Round 2 questions (Artist and Title)
      for (let question = 6; question <= 10; question++) {
        cy.get(`#round2-q${question}`).type(`Artist ${question}`);
        cy.get(`#round2-q${question}-title`).type(`Song Title ${question}`);
      }
  
      // Fill Round 3 questions (Artist and Title)
      for (let question = 11; question <= 15; question++) {
        cy.get(`#round3-q${question}`).type(`Artist ${question}`);
        cy.get(`#round3-q${question}-title`).type(`Song Title ${question}`);
      }
  
      // Fill Round 4 questions (Artist and Title)
      for (let question = 16; question <= 20; question++) {
        cy.get(`#round4-q${question}`).type(`Artist ${question}`);
        cy.get(`#round4-q${question}-title`).type(`Song Title ${question}`);
      }
  
      // Fill Round 5 questions (Artist and Title)
      for (let question = 21; question <= 25; question++) {
        cy.get(`#round5-q${question}`).type(`Artist ${question}`);
        cy.get(`#round5-q${question}-title`).type(`Song Title ${question}`);
      }
  
      // Fill Final Round questions (Lyric and Word Count)
      for (let question = 1; question <= 4; question++) {
        cy.get(`#final-q${question}-lyric`).type(`Lyric ${question}`);
        cy.get(`#final-q${question}-words`).type(`${question * 3}`);
      }
  
      // Submit the form
      cy.get("#submit-game").click();
  
      // Verify success by checking if redirected to dashboard
      cy.url().should("include", "/admin/dashboard.html");
    });
  });