import MainInput from "../../../../components/form/MainInput";

const Reminders = () => {
  return (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MainInput id="itemName" label="item name" />
        <MainInput id="reminderTime" label="reminder time" />
        <MainInput id="remarks" label="remarks" />
        <MainInput id="email" label="email" />
      </div>
    </section>
  );
};

export default Reminders;
