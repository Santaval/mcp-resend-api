export default function reviewCode() {
  return `
# Create Contact

> Create a contact inside an audience.

## Body Parameters

<ParamField body="email" type="string" required>
  The email address of the contact.
</ParamField>

<ParamField path="audience_id" type="string" required>
  The Audience ID.
</ParamField>

<ParamField body="first_name" type="string">
  The first name of the contact.
</ParamField>

<ParamField body="last_name" type="string">
  The last name of the contact.
</ParamField>

<ParamField body="unsubscribed" type="boolean">
  The subscription status.
</ParamField>

<RequestExample>
  \`\`\`ts Node.js
  import { Resend } from 'resend';

  const resend = new Resend('re_xxxxxxxxx');

  const { data, error } = await resend.contacts.create({
    email: 'steve.wozniak@gmail.com',
    firstName: 'Steve',
    lastName: 'Wozniak',
    unsubscribed: false,
    audienceId: '78261eea-8f8b-4381-83c6-79fa7120f1cf',
  });
  \`\`\`

  \`\`\`php PHP
  $resend = Resend::client('re_xxxxxxxxx');

  $resend->contacts->create(
    audienceId: '78261eea-8f8b-4381-83c6-79fa7120f1cf',
    parameters: [
      'email' => 'steve.wozniak@gmail.com',
      'first_name' => 'Steve',
      'last_name' => 'Wozniak',
      'unsubscribed' => false
    ]
  );
  \`\`\`

  \`\`\`python Python
  import resend

  resend.api_key = "re_xxxxxxxxx"

  params: resend.Contacts.CreateParams = {
    "email": "steve.wozniak@gmail.com",
    "first_name": "Steve",
    "last_name": "Wozniak",
    "unsubscribed": False,
    "audience_id": "78261eea-8f8b-4381-83c6-79fa7120f1cf",
  }

  resend.Contacts.create(params)
  \`\`\`

  \`\`\`ruby Ruby
  require "resend"

  Resend.api_key = "re_xxxxxxxxx"

  params = {
    "email": "steve.wozniak@gmail.com",
    "first_name": "Steve",
    "last_name": "Wozniak",
    "unsubscribed": false,
    "audience_id": "78261eea-8f8b-4381-83c6-79fa7120f1cf",
  }

  Resend::Contacts.create(params)
  \`\`\`

  \`\`\`go Go
  import 	"github.com/resend/resend-go/v2"

  client := resend.NewClient("re_xxxxxxxxx")

  params := &resend.CreateContactRequest{
    Email:        "steve.wozniak@gmail.com",
    FirstName:    "Steve",
    LastName:     "Wozniak",
    Unsubscribed: false,
    AudienceId:   "78261eea-8f8b-4381-83c6-79fa7120f1cf",
  }

  contact, err := client.Contacts.Create(params)
  \`\`\`

  \`\`\`rust Rust
  use resend_rs::{types::ContactData, Resend, Result};

  #[tokio::main]
  async fn main() -> Result<()> {
    let resend = Resend::new("re_xxxxxxxxx");

    let contact = ContactData::new("steve.wozniak@gmail.com")
      .with_first_name("Steve")
      .with_last_name("Wozniak")
      .with_unsubscribed(false);

    let _contact = resend
      .contacts
      .create("78261eea-8f8b-4381-83c6-79fa7120f1cf", contact)
      .await?;

    Ok(())
  }
  \`\`\`

  \`\`\`java Java
  import com.resend.*;

  public class Main {
      public static void main(String[] args) {
          Resend resend = new Resend("re_xxxxxxxxx");

          CreateContactOptions params = CreateContactOptions.builder()
                  .email("steve.wozniak@gmail.com")
                  .firstName("Steve")
                  .lastName("Wozniak")
                  .unsubscribed(false)
                  .audienceId("78261eea-8f8b-4381-83c6-79fa7120f1cf")
                  .build();

          CreateContactResponseSuccess data = resend.contacts().create(params);
      }
  }
  \`\`\`

  \`\`\`csharp .NET
  using Resend;

  IResend resend = ResendClient.Create( "re_xxxxxxxxx" ); // Or from DI

  var resp = await resend.ContactAddAsync(
      new Guid( "78261eea-8f8b-4381-83c6-79fa7120f1cf" ),
      new ContactData()
      {
          Email = "steve.wozniak@gmail.com",
          FirstName = "Steve",
          LastName = "Wozniak",
          IsUnsubscribed = false,
      }
  );
  Console.WriteLine( "Contact Id={0}", resp.Content );
  \`\`\`

  \`\`\`bash cURL
  curl -X POST 'https://api.resend.com/audiences/78261eea-8f8b-4381-83c6-79fa7120f1cf/contacts' \
       -H 'Authorization: Bearer re_xxxxxxxxx' \
       -H 'Content-Type: application/json' \
       -d $'{
    "email": "steve.wozniak@gmail.com",
    "first_name": "Steve",
    "last_name": "Wozniak",
    "unsubscribed": false
  }'
  \`\`\`
</RequestExample>

<ResponseExample>
  \`\`\`json Response
  {
    "object": "contact",
    "id": "479e3145-dd38-476b-932c-529ceb705947"
  }
  \`\`\`
</ResponseExample>
  `;
}
